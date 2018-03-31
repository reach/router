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

import * as qs from "query-string";

const __COMPAT__ = true;

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
    console.log("getContext");
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
      unstable_deferredUpdates(() => {
        this.setState(() => ({ context: this.getContext() }));
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

    if (__COMPAT__) {
      if (element.type === Route) {
        props.params = params;
        props.key = element.props.path;
      }
    }

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
  if (__COMPAT__) {
    let { activeClassName, activeStyle, ...rest } = anchorProps;
    anchorProps = rest;
  }
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
    if (!noThrow) redirect(insertParams(to, props));
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
// RR v3 Compatibility
let Route;
let IndexRoute;
let browserHistory;

if (__COMPAT__) {
  Route = class Route extends React.Component {
    state = {
      onEnterReady: this.props.onEnter ? false : true
    };

    componentDidMount() {
      this.runEnterHook();
    }

    componentWillUnmount() {
      if (this.props.onLeave) {
        const { location, params } = this.props;
        this.props.onLeave({ location, params });
      }
    }

    componentDidUpdate(prevProps) {
      let { onChange } = this.props;
      if (onChange) {
        let { location, params, router } = getCompatProps(this.props);
        let { location: pLocation, params: pParams } = getCompatProps(
          prevProps
        );
        let prevState = { location: pLocation, params: pParams };
        let nextState = { location, params };
        let replaceArg;
        let replace = arg => (replaceArg = arg);
        let callback = () => {
          Promise.resolve().then(() => {
            if (replaceArg) {
              router.replace(replaceArg);
            } else {
              this.setState({ onEnterReady: true });
            }
          });
        };
        onChange(prevState, nextState, replace, callback);
        if (onChange.length < 3) callback();
      }
    }

    runEnterHook() {
      const { onEnter, navigate } = this.props;
      if (onEnter) {
        let { location, params, router } = getCompatProps(this.props);
        let nextState = { location, params };
        let replaceArg;
        let replace = arg => (replaceArg = arg);
        let callback = () => {
          // next tick hack since this didMount runs before
          // top level LocationProvider's subscription
          Promise.resolve().then(() => {
            if (replaceArg) {
              router.replace(replaceArg);
            } else {
              this.setState({ onEnterReady: true });
            }
          });
        };
        onEnter(nextState, replace, callback);
        if (onEnter.length < 3) callback();
      }
    }

    render() {
      let { onEnterReady } = this.state;

      let { component: Component, ...props } = this.props;
      let compatProps = getCompatProps(props);
      return onEnterReady ? <Component {...compatProps} /> : null;
    }
  };

  let getCompatProps = props => {
    let { location, children, navigate, params } = props;

    location = { ...location };
    location.query = qs.parse(location.search.substring(1));

    if (params && params["*"]) {
      params.splat = params["*"];
      delete params["*"];
    }

    let wrappedNavigate = (arg, replace = false) => {
      if (typeof arg === "object") {
        let { pathname, query, ...rest } = arg;
        let to = query ? [pathname, qs.stringify(query)].join("?") : pathname;
        navigate(to, { replace, ...rest });
      } else {
        navigate(arg, { replace });
      }
    };

    let router = {
      replace: arg => wrappedNavigate(arg, true),
      push: arg => wrappedNavigate(arg, false),
      location,
      params
    };

    return { children, params, location, router };
  };

  browserHistory = {};

  IndexRoute = class IndexRoute extends Route {
    static defaultProps = { path: "/" };
  };
}

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
  navigate,
  // RRv3 Compat
  Route,
  IndexRoute,
  browserHistory
};
