/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react";
import warning from "warning";
import PropTypes from "prop-types";
import invariant from "invariant";
import createContext from "create-react-context";
import { polyfill } from "react-lifecycles-compat";
import ReactDOM from "react-dom";
import {
  startsWith,
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

const createNamedContext = (name, defaultValue) => {
  const Ctx = createContext(defaultValue);
  Ctx.Consumer.displayName = `${name}.Consumer`;
  Ctx.Provider.displayName = `${name}.Provider`;
  return Ctx;
};

////////////////////////////////////////////////////////////////////////////////
// Location Context/Provider
let LocationContext = createNamedContext("Location");

// sets up a listener if there isn't one already so apps don't need to be
// wrapped in some top level provider
let Location = ({ children }) => (
  <LocationContext.Consumer>
    {context =>
      context ? (
        children(context)
      ) : (
        <LocationProvider>{children}</LocationProvider>
      )
    }
  </LocationContext.Consumer>
);

class LocationProvider extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  };

  static defaultProps = {
    history: globalHistory
  };

  state = {
    context: this.getContext(),
    refs: { unlisten: null }
  };

  getContext() {
    let {
      props: {
        history: { navigate, location }
      }
    } = this;
    return { navigate, location };
  }

  componentDidCatch(error, info) {
    if (isRedirect(error)) {
      let {
        props: {
          history: { navigate }
        }
      } = this;
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
    let {
      state: { refs },
      props: { history }
    } = this;
    refs.unlisten = history.listen(() => {
      Promise.resolve().then(() => {
        unstable_deferredUpdates(() => {
          if (!this.unmounted) {
            this.setState(() => ({ context: this.getContext() }));
          }
        });
      });
    });
  }

  componentWillUnmount() {
    let {
      state: { refs }
    } = this;
    this.unmounted = true;
    refs.unlisten();
  }

  render() {
    let {
      state: { context },
      props: { children }
    } = this;
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
let BaseContext = createNamedContext("Base", { baseuri: "/", basepath: "/" });

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
  static defaultProps = {
    primary: true
  };

  render() {
    let {
      location,
      navigate,
      basepath,
      primary,
      children,
      baseuri,
      component = "div",
      ...domProps
    } = this.props;
    let routes = React.Children.map(children, createRoute(basepath));
    let { pathname } = location;

    let match = pick(routes, pathname);

    if (match) {
      let {
        params,
        uri,
        route,
        route: { value: element }
      } = match;

      // remove the /* from the end for child routes relative paths
      basepath = route.default ? basepath : route.path.replace(/\*$/, "");

      let props = {
        ...params,
        uri,
        location,
        navigate: (to, options) => navigate(resolve(to, uri), options)
      };

      let clone = React.cloneElement(
        element,
        props,
        element.props.children ? (
          <Router primary={primary}>{element.props.children}</Router>
        ) : (
          undefined
        )
      );

      // using 'div' for < 16.3 support
      let FocusWrapper = primary ? FocusHandler : component;
      // don't pass any props to 'div'
      let wrapperProps = primary
        ? { uri, location, component, ...domProps }
        : domProps;

      return (
        <BaseContext.Provider value={{ baseuri: uri, basepath }}>
          <FocusWrapper {...wrapperProps}>{clone}</FocusWrapper>
        </BaseContext.Provider>
      );
    } else {
      // Not sure if we want this, would require index routes at every level
      // warning(
      //   false,
      //   `<Router basepath="${basepath}">\n\nNothing matched:\n\t${
      //     location.pathname
      //   }\n\nPaths checked: \n\t${routes
      //     .map(route => route.path)
      //     .join(
      //       "\n\t"
      //     )}\n\nTo get rid of this warning, add a default NotFound component as child of Router:
      //   \n\tlet NotFound = () => <div>Not Found!</div>
      //   \n\t<Router>\n\t  <NotFound default/>\n\t  {/* ... */}\n\t</Router>`
      // );
      return null;
    }
  }
}

let FocusContext = createNamedContext("Focus");

let FocusHandler = ({ uri, location, component, ...domProps }) => (
  <FocusContext.Consumer>
    {requestFocus => (
      <FocusHandlerImpl
        {...domProps}
        component={component}
        requestFocus={requestFocus}
        uri={uri}
        location={location}
      />
    )}
  </FocusContext.Consumer>
);

// don't focus on initial render
let initialRender = true;
let focusHandlerCount = 0;

class FocusHandlerImpl extends React.Component {
  state = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    let initial = prevState.uri == null;
    if (initial) {
      return {
        shouldFocus: true,
        ...nextProps
      };
    } else {
      let myURIChanged = nextProps.uri !== prevState.uri;
      let navigatedUpToMe =
        prevState.location.pathname !== nextProps.location.pathname &&
        nextProps.location.pathname === nextProps.uri;
      return {
        shouldFocus: myURIChanged || navigatedUpToMe,
        ...nextProps
      };
    }
  }

  componentDidMount() {
    focusHandlerCount++;
    this.focus();
  }

  componentWillUnmount() {
    focusHandlerCount--;
    if (focusHandlerCount === 0) {
      initialRender = true;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location !== this.props.location && this.state.shouldFocus) {
      this.focus();
    }
  }

  focus() {
    if (process.env.NODE_ENV === "test") {
      // getting cannot read property focus of null in the tests
      // and that bit of global `initialRender` state causes problems
      // should probably figure it out!
      return;
    }

    let { requestFocus } = this.props;

    if (requestFocus) {
      requestFocus(this.node);
    } else {
      if (initialRender) {
        initialRender = false;
      } else {
        this.node.focus();
      }
    }
  }

  requestFocus = node => {
    if (!this.state.shouldFocus) {
      node.focus();
    }
  };

  render() {
    let {
      children,
      style,
      requestFocus,
      role = "group",
      component: Comp = "div",
      uri,
      location,
      ...domProps
    } = this.props;
    return (
      <Comp
        style={{ outline: "none", ...style }}
        tabIndex="-1"
        role={role}
        ref={n => (this.node = n)}
        {...domProps}
      >
        <FocusContext.Provider value={this.requestFocus}>
          {this.props.children}
        </FocusContext.Provider>
      </Comp>
    );
  }
}

polyfill(FocusHandlerImpl);

let k = () => {};

////////////////////////////////////////////////////////////////////////////////
let { forwardRef } = React;
if (typeof forwardRef === "undefined") {
  forwardRef = C => C;
}

let Link = forwardRef(({ innerRef, ...props }, ref) => (
  <BaseContext.Consumer>
    {({ basepath, baseuri }) => (
      <Location>
        {({ location, navigate }) => {
          let { to, state, replace, getProps = k, ...anchorProps } = props;
          let href = resolve(to, baseuri);
          let isCurrent = location.pathname === href;
          let isPartiallyCurrent = startsWith(location.pathname, href);

          return (
            <a
              ref={ref || innerRef}
              aria-current={isCurrent ? "page" : undefined}
              {...anchorProps}
              {...getProps({ isCurrent, isPartiallyCurrent, href, location })}
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
));

////////////////////////////////////////////////////////////////////////////////
function RedirectRequest(uri) {
  this.uri = uri;
}

let isRedirect = o => o instanceof RedirectRequest;

let redirectTo = to => {
  throw new RedirectRequest(to);
};

class RedirectImpl extends React.Component {
  // Support React < 16 with this hook
  componentDidMount() {
    let {
      props: { navigate, to, from, replace = true, state, noThrow, ...props }
    } = this;
    Promise.resolve().then(() => {
      navigate(insertParams(to, props), { replace, state });
    });
  }

  render() {
    let {
      props: { navigate, to, from, replace, state, noThrow, ...props }
    } = this;
    if (!noThrow) redirectTo(insertParams(to, props));
    return null;
  }
}

let Redirect = props => (
  <Location>
    {locationContext => <RedirectImpl {...locationContext} {...props} />}
  </Location>
);

Redirect.propTypes = {
  from: PropTypes.string,
  to: PropTypes.string.isRequired
};

////////////////////////////////////////////////////////////////////////////////
let Match = ({ path, children }) => (
  <BaseContext.Consumer>
    {({ baseuri }) => (
      <Location>
        {({ navigate, location }) => {
          let resolvedPath = resolve(path, baseuri);
          let result = match(resolvedPath, location.pathname);
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
    )}
  </BaseContext.Consumer>
);

////////////////////////////////////////////////////////////////////////////////
// Junk
let stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

let createRoute = basepath => element => {
  if (!element) {
    return null;
  }

  invariant(
    element.props.path || element.props.default || element.type === Redirect,
    `<Router>: Children of <Router> must have a \`path\` or \`default\` prop, or be a \`<Redirect>\`. None found on element type \`${
      element.type
    }\``
  );

  invariant(
    !(element.type === Redirect && (!element.props.from || !element.props.to)),
    `<Redirect from="${element.props.from} to="${
      element.props.to
    }"/> requires both "from" and "to" props when inside a <Router>.`
  );

  invariant(
    !(
      element.type === Redirect &&
      !validateRedirect(element.props.from, element.props.to)
    ),
    `<Redirect from="${element.props.from} to="${
      element.props.to
    }"/> has mismatched dynamic segments, ensure both paths have the exact same dynamic segments.`
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
  Location,
  LocationProvider,
  Match,
  Redirect,
  Router,
  ServerLocation,
  createHistory,
  createMemorySource,
  isRedirect,
  navigate,
  redirectTo
};
