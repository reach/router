/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react";
import warning from "warning";
import invariant from "invariant";
import createContext from "create-react-context";
import ReactDOM from "react-dom";
import {
  pick,
  resolve,
  match,
  insertParams,
  validateRedirect
} from "./lib/utils";
import {
  globalHistory,
  navigate,
  createHistory,
  createMemorySource
} from "./lib/history";

////////////////////////////////////////////////////////////////////////////////
// React polyfill
let { unstable_deferredUpdates } = ReactDOM;
if (unstable_deferredUpdates === undefined) {
  unstable_deferredUpdates = fn => fn();
}

////////////////////////////////////////////////////////////////////////////////
// Location Context/Provider
let LocationContext = createContext();
LocationContext.Consumer.displayName = "Location.Consumer";
LocationContext.Provider.displayName = "Location.Provider";

// sets up a listener if there isn't one already so apps don't need to be
// wrapped in some top level provider
let Location = ({ children }) => (
  <LocationContext.Consumer>
    {context =>
      context ? (
        children(context)
      ) : (
        <LocationProvider>{context => children(context)}</LocationProvider>
      )
    }
  </LocationContext.Consumer>
);

class LocationProvider extends React.Component {
  static defaultProps = {
    history: globalHistory
  };

  state = {
    context: this.getContext(),
    refs: { unlisten: null }
  };

  getContext() {
    let { props: { history: { navigate, location } } } = this;
    return { navigate, location };
  }

  componentDidCatch(error, info) {
    if (isRedirect(error)) {
      let { props: { history: { navigate } } } = this;
      navigate(error.uri, { replace: true });
    } else {
      throw error;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.context.location !== this.state.context.location) {
      this.props.history._onTransitionComplete();
    }
  }

  componentDidMount() {
    let { state: { refs }, props: { history } } = this;
    refs.unlisten = history.listen(() => {
      Promise.resolve().then(() => {
        unstable_deferredUpdates(() => {
          this.setState(() => ({ context: this.getContext() }));
        });
      });
    });
  }

  componentWillUnmount() {
    let { state: { refs } } = this;
    refs.unlisten();
  }

  render() {
    let { state: { context }, props: { children } } = this;
    return (
      <LocationContext.Provider value={context}>
        {typeof children === "function" ? children(context) : children || null}
      </LocationContext.Provider>
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
let ServerLocation = ({ url, children }) => (
  <LocationContext.Provider
    value={{
      location: { pathname: url },
      navigate: () => {
        throw new Error("You can't call navigate on the server.");
      }
    }}
  >
    {children}
  </LocationContext.Provider>
);

////////////////////////////////////////////////////////////////////////////////
// Sets baseuri and basepath for nested routers and links
let BaseContext = createContext({ baseuri: "/", basepath: "/" });
BaseContext.Consumer.displayName = "Base.Consumer";
BaseContext.Provider.displayName = "Base.Provider";

////////////////////////////////////////////////////////////////////////////////
// The main event, welcome to the show everybody.
let Router = props => (
  <BaseContext.Consumer>
    {baseContext => (
      <Location>
        {locationContext => (
          <RouterImpl {...baseContext} {...locationContext} {...props} />
        )}
      </Location>
    )}
  </BaseContext.Consumer>
);
class RouterImpl extends React.PureComponent {
  render() {
    let { location, navigate, basepath, children } = this.props;
    let routes = React.Children.map(children, createRoute(basepath));

    let match = pick(routes, location.pathname);

    if (match) {
      let { params, uri, route, route: { value: element } } = match;

      // remove the /* from the end for child routes relative paths
      basepath = route.default ? basepath : route.path.replace(/\*$/, "");

      let props = {
        ...params,
        uri,
        location,
        navigate: (to, options) => navigate(resolve(to, uri), options)
      };

      let childRouterProps;

      let clone = React.cloneElement(
        element,
        props,
        element.props.children || childRouterProps ? (
          <Router {...childRouterProps}>{element.props.children}</Router>
        ) : (
          undefined
        )
      );

      return (
        <BaseContext.Provider value={{ baseuri: uri, basepath }}>
          {clone}
        </BaseContext.Provider>
      );
    } else {
      warning(
        true,
        `<Router basepath="${basepath}">\n\nNothing matched:\n\t${
          location.pathname
        }\n\nPaths checked: \n\t${routes
          .map(route => route.path)
          .join(
            "\n\t"
          )}\n\nTo get rid of this warning, add a default NotFound component as child of Router:
        \n\tlet NotFound = () => <div>Not Found!</div>
        \n\t<Router>\n\t  <NotFound default/>\n\t  {/* ... */}\n\t</Router>`
      );
      return null;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
let Link = props => (
  <BaseContext.Consumer>
    {({ basepath, baseuri }) => (
      <Location>
        {({ navigate }) => {
          let { location, to, state, replace, ...anchorProps } = props;

          let href = resolve(to, baseuri);

          return (
            <a
              {...anchorProps}
              href={href}
              onClick={event => {
                if (anchorProps.onClick) anchorProps.onClick(event);
                if (shouldNavigate(event)) {
                  event.preventDefault();
                  navigate(href, { state, replace });
                }
              }}
            />
          );
        }}
      </Location>
    )}
  </BaseContext.Consumer>
);

////////////////////////////////////////////////////////////////////////////////
function RedirectRequest(uri) {
  this.uri = uri;
}

let isRedirect = o => o instanceof RedirectRequest;

let redirect = to => {
  throw new RedirectRequest(to);
};

class RedirectImpl extends React.Component {
  // Support React < 16 with this hook
  componentDidMount() {
    let {
      props: { navigate, to, from, replace = true, state, noThrow, ...props }
    } = this;
    navigate(insertParams(to, props), { replace, state });
  }

  render() {
    let {
      props: { navigate, to, from, replace, state, noThrow, ...props }
    } = this;
    if (!noThrow) redirect(insertParams(to, props));
    return null;
  }
}

let Redirect = props => (
  <Location>
    {locationContext => <RedirectImpl {...locationContext} {...props} />}
  </Location>
);

Redirect.propTypes = {
  from: (props, name) => {
    if (!props.to)
      return new Error('<Redirect> requires both "from" and "to" props.');
    if (!validateRedirect(props.from, props.to)) {
      return new Error(
        `<Redirect from="${props.from} to="${
          props.to
        }"/> has mismatched dynamic segments, ensure both paths have the exact same dynamic segments.`
      );
    }
  },
  to: (props, name) => {
    if (!props.from)
      return new Error('<Redirect> requires both "from" and "to" props.');
  }
};

////////////////////////////////////////////////////////////////////////////////
let Match = ({ path, children }) => (
  <Location>
    {({ navigate, location }) => {
      let result = match(path, location.pathname);
      return children({
        navigate,
        location,
        match: result
          ? {
              ...result.params,
              uri: result.uri,
              path
            }
          : null
      });
    }}
  </Location>
);

////////////////////////////////////////////////////////////////////////////////
// Junk
let stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

let createRoute = basepath => element => {
  invariant(
    element.props.path || element.props.default || element.type === Redirect,
    `<Router>: Children of <Router> must have a \`path\` or \`default\` prop, or be a \`<Redirect>\`. None found on element type \`${
      element.type
    }\``
  );

  if (element.props.default) {
    return { value: element, default: true };
  }

  let elementPath =
    element.type === Redirect ? element.props.from : element.props.path;

  let path =
    elementPath === "/"
      ? basepath
      : `${stripSlashes(basepath)}/${stripSlashes(elementPath)}`;

  return {
    value: element,
    default: element.props.default,
    path: element.props.children ? `${stripSlashes(path)}/*` : path
  };
};

let shouldNavigate = event =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

////////////////////////////////////////////////////////////////////////
export {
  Link,
  LocationProvider,
  Match,
  Redirect,
  Router,
  ServerLocation,
  createHistory,
  createMemorySource,
  isRedirect,
  navigate,
  redirect
};
