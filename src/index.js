/*eslint-disable jsx-a11y/anchor-has-content */
import React, { Children, cloneElement } from "react";
import warning from "warning";
import invariant from "invariant";
import createContextPolyfill from "create-react-context";
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
// React polyfills
let { createContext } = React;
if (createContext === undefined) {
  createContext = createContextPolyfill;
}

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
let withLocation = Comp => {
  const C = props => (
    <LocationContext.Consumer>
      {context =>
        context ? (
          <Comp {...context} {...props} />
        ) : (
          <LocationProvider>
            {context => <Comp {...context} {...props} />}
          </LocationProvider>
        )
      }
    </LocationContext.Consumer>
  );
  C.displayName = `withLocation(${Comp.displayName || Comp.name})`;
  return C;
};

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
    return { navigate, location: { ...location } };
  }

  componentDidCatch(error, info) {
    if (isRedirect(error)) {
      let { props: { history: { navigate } } } = this;
      navigate(error.uri, { replace: true });
    } else {
      throw error;
    }
  }

  componentDidMount() {
    let { state: { refs }, props: { history } } = this;
    refs.unlisten = history.listen(() => {
      unstable_deferredUpdates(() => {
        this.setState(
          () => ({ context: this.getContext() }),
          history._onTransitionComplete
        );
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
let ServerRenderContext = ({ url, children }) => (
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

let withBase = Comp => {
  let C = props => (
    <BaseContext.Consumer>
      {context => (
        // props second so basepath can be passed in as a prop and win
        <Comp {...context} {...props} />
      )}
    </BaseContext.Consumer>
  );
  C.displayName = `withBase(${Comp.displayName || Comp.name})`;
  return C;
};

////////////////////////////////////////////////////////////////////////////////
// The main event, welcome to the show everybody.
let Router = ({ location, navigate, basepath, baseuri, children }) => {
  let routes = Children.map(children, createRoute(basepath));
  let match = pick(routes, location.pathname);

  if (match) {
    let { params, uri, route, route: { value: element } } = match;

    // remove the /* from the end for child routes relative paths
    basepath = route.default ? basepath : route.path.replace(/\/\*$/, "");

    let props = {
      ...params,
      uri,
      location,
      navigate: (to, options) => navigate(resolve(to, uri), options)
    };

    let clone = cloneElement(
      element,
      props,
      element.props.children ? (
        <Router>{element.props.children}</Router>
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
        \n\tconst NotFound = () => <div>Not Found!</div>
        \n\t<Router>\n\t  <NotFound default/>\n\t  {/* ... */}\n\t</Router>`
    );
    return null;
  }
};

Router = withBase(withLocation(Router));

////////////////////////////////////////////////////////////////////////////////
let Link = ({
  basepath,
  baseuri,
  navigate,
  location,
  to,
  state,
  replace,
  ...anchorProps
}) => {
  const href = resolve(to, baseuri);
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
};

Link = withBase(withLocation(Link));

////////////////////////////////////////////////////////////////////////////////
function RedirectRequest(uri) {
  this.uri = uri;
}

let isRedirect = o => o instanceof RedirectRequest;

let redirect = to => {
  throw new RedirectRequest(to);
};

class Redirect extends React.Component {
  // Support React < 16 with this hook
  componentDidMount() {
    const {
      props: { navigate, to, from, replace = true, state, noThrow, ...props }
    } = this;
    navigate(insertParams(to, props), { replace, state });
  }

  render() {
    const {
      props: { navigate, to, from, replace, state, noThrow, ...props }
    } = this;
    if (!noThrow && React.version > 15) redirect(insertParams(to, props));
    return null;
  }
}

Redirect = withLocation(Redirect);

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
let MatchPath = ({ path, location, navigate, children }) => {
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
};

MatchPath = withLocation(MatchPath);

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
  Router,
  Link,
  Redirect,
  redirect,
  isRedirect,
  MatchPath,
  LocationProvider,
  ServerRenderContext,
  createHistory,
  createMemorySource,
  navigate
};
