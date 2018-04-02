/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Children, cloneElement } from "react";
import warning from "warning";
import invariant from "invariant";
import createContextPolyfill from "create-react-context";
import ReactDOM from "react-dom";
import * as qs from "query-string";
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

const __COMPAT__ = process.env.COMPAT === "1";

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
let label = "[@reactions/router]";
let deprecate = {
  object: (o, getMessage) => {
    let object = {};
    for (let key in o) {
      if (o.hasOwnProperty(key)) {
        let message = getMessage(key);
        if (!message) continue;
        if (typeof o[key] === "function") {
          let old = o[key];
          object[key] = (...args) => {
            console.warn(label, message);
            return old.apply(object, args);
          };
        } else {
          Object.defineProperty(object, key, {
            enumerable: true,
            get() {
              console.warn(label, message);
              return o[key];
            }
          });
        }
      }
    }
    return object;
  },
  message: (...args) => {
    console.warn(label, ...args);
  }
};

////////////////////////////////////////////////////////////////////////////////
// Location Context/Provider
let LocationContext = createContext();
LocationContext.Consumer.displayName = "Location.Consumer";
LocationContext.Provider.displayName = "Location.Provider";

// sets up a listener if there isn't one already so apps don't need to be
// wrapped in some top level provider
let withLocation = Comp => {
  let C = props => (
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
let Router = ({
  location,
  navigate,
  basepath,
  baseuri,
  children,

  // compat
  routes: __compatRoutes,
  ...__compatPassedProps
}) => {
  let routes = Children.map(children, createRoute(basepath));

  if (__COMPAT__) {
    if (__compatRoutes) {
      routes = createCompatRoutes(__compatRoutes, basepath);
    }
  }

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
    if (__COMPAT__) {
      if (match.route.childRoutes) {
        childRouterProps = { routes: match.route.childRoutes };
      }
      if (element.type.__compatRoute) {
        props.params = params;
        props.key = element.props.path;
        props.__compatPassedProps = __compatPassedProps;
      }
    }

    let clone = cloneElement(
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
};

Router = withBase(withLocation(Router));

////////////////////////////////////////////////////////////////////////////////
let Link = props => {
  if (__COMPAT__) {
    if (shouldUseCompatLink(props)) {
      return <CompatLink {...props} />;
    }
  }

  let {
    basepath,
    baseuri,
    navigate,
    location,
    to,
    state,
    replace,
    ...anchorProps
  } = props;

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

  if (__COMPAT__) {
    if (element.type.__compatRoute && element.props.path === "*") {
      return { value: element, default: true };
    }
  }

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

let createCompatRoutes = () => {};
if (__COMPAT__) {
  createCompatRoutes = (items, basepath) => {
    let routes = [];
    items.forEach(item => {
      let { childRoutes, getChildRoutes, indexRoute, ...props } = item;

      if (item.path === "*") {
        return { value: item, default: true };
      }

      let path =
        item.path === "/"
          ? basepath
          : `${stripSlashes(basepath)}/${stripSlashes(item.path)}`;

      if (indexRoute) {
        let route = { ...indexRoute, path: "/" };
        if (childRoutes) {
          childRoutes.push(route);
        } else {
          childRoutes = [route];
        }
      }

      routes.push({
        value: <Route {...item} />,
        childRoutes: childRoutes,
        path: childRoutes || getChildRoutes ? `${stripSlashes(path)}/*` : path
      });
    });
    return routes;
  };
}

let shouldNavigate = event =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

////////////////////////////////////////////////////////////////////////
// COMPAT!
let CompatLink;
let IndexLink;
let IndexRoute;
let Route;
let browserHistory;
let shouldUseCompatLink = () => false;
let RouteContext;
let withRouter;

if (__COMPAT__) {
  shouldUseCompatLink = props => {
    return (
      typeof props.to === "object" ||
      props.activeStyle != null ||
      props.activeClassName != null ||
      props.onlyActiveOnIndex != null
    );
  };

  RouteContext = createContext();

  withRouter = Comp => {
    let C = props => (
      <RouteContext.Consumer>
        {context => <Comp {...context} {...props} />}
      </RouteContext.Consumer>
    );
    C.displayName = `withRouter(${C.displayName || C.name})`;
    return C;
  };

  let wrappedNavigate = (navigate, arg, replace = false) => {
    if (typeof arg === "object") {
      let { pathname, query, ...rest } = arg;
      let to = query ? [pathname, qs.stringify(query)].join("?") : pathname;
      navigate(to, { replace, ...rest });
    } else {
      navigate(arg, { replace });
    }
  };

  browserHistory = {
    replace: arg => wrappedNavigate(navigate, arg, true),
    push: arg => wrappedNavigate(navigate, arg, false),
    listen: globalHistory.listen
  };

  if (__DEV__) {
    browserHistory = deprecate.object(browserHistory, key => {
      if (key === "push") {
        return `\`browserHistory.${key}(...)\` is deprecated. Use \`navigate(to)\``;
      } else if (key === "replace") {
        return `\`browserHistory.${key}(...)\` is deprecated. Use \`navigate(to, { replace: true })\``;
      } else {
        return `\`browserHistory.${key}(...)\` is deprecated. For more info: https://bit.ly/history-listen`;
      }
    });
  }

  Route = class Route extends React.Component {
    static __compatRoute = true;

    constructor(props) {
      super(props);

      if (__DEV__) {
        let compName =
          this.props.component.displayName || this.props.component.name;
        let path = this.props.path;
        let isIndex = this instanceof IndexRoute;
        if (isIndex) {
          deprecate.message(
            `<IndexRoute component={${compName}}> is deprecated. Use \`<${compName} path="/">\` For more help, see http://bit.ly/deprecation-route`
          );
        } else if (path === "*") {
          deprecate.message(
            `<Route path="*" component={${compName}}> is deprecated. Use \`<${compName} default>\` For more help, see http://bit.ly/deprecation-route`
          );
        } else {
          deprecate.message(
            `<Route path="${path}" component={${compName}}> is deprecated. Use \`<${compName} path="${path}">\` For more help, see http://bit.ly/deprecation-route`
          );
        }
      }

      this.state = {
        onEnterReady: this.props.onEnter ? false : true,
        getComponentReady: this.props.getComponent ? false : true,
        getChildRoutesReady: this.props.getChildRoutes ? false : true,
        StateComp: undefined,
        childRoutes: undefined
      };
    }

    componentDidMount() {
      this.runEnterHook();
      this.getComponent();
      this.getChildRoutes();
    }

    getChildRoutes() {
      let { getChildRoutes, location, params } = this.props;
      if (getChildRoutes) {
        if (__DEV__) {
          deprecate.message(
            "<Route getChildRoutes> is deprecated. Use code-splitting features of your bundler. For help, see http://bit.ly/get-child-routes"
          );
        }
        getChildRoutes({ location, params }, (err, childRoutes) => {
          this.setState({ childRoutes, getChildRoutesReady: true });
        });
      }
    }

    getComponent() {
      let { getComponent, location, params } = this.props;
      if (getComponent) {
        if (__DEV__) {
          deprecate.message(
            "<Route getComponent> is deprecated. Use code-splitting features of your bundler. For help, see http://bit.ly/get-component"
          );
        }
        getComponent({ location, params }, (err, StateComp) => {
          this.setState({ StateComp, getComponentReady: true });
        });
      }
    }

    componentWillUnmount() {
      if (this.props.onLeave) {
        let { location, params } = this.props;
        this.props.onLeave({ location, params });
      }
    }

    componentDidUpdate(prevProps) {
      let { onChange } = this.props;
      if (onChange) {
        if (__DEV__) {
          deprecate.message(
            "<Route onChange> is deprecated. Use move logic to `componentDidUpdate`."
          );
        }
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
      let { onEnter, navigate } = this.props;
      if (onEnter) {
        if (__DEV__) {
          deprecate.message(
            "<Route onEnter> is deprecated. Move the logic to componentDidMount. For more help, see http://bit.ly/route-on-enter"
          );
        }
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
      let {
        onEnterReady,
        getComponentReady,
        getChildRoutesReady,
        StateComp,
        childRoutes
      } = this.state;

      if (!onEnterReady || !getComponentReady || !getChildRoutesReady) {
        return null;
      }

      let {
        component: PropComp,
        components,
        __compatPassedProps,
        ...props
      } = this.props;

      let compatProps = getCompatProps(props);
      let Comp = StateComp || PropComp;

      let children = props.children;

      if (childRoutes) {
        children = <Router routes={childRoutes} />;
      }

      return (
        <RouteContext.Provider value={compatProps}>
          <Comp
            {...props}
            {...compatProps}
            {...__compatPassedProps}
            children={children}
          />
        </RouteContext.Provider>
      );
    }
  };

  let getCompatProps = props => {
    let { location, children, params, navigate } = props;
    location.query = qs.parse(location.search.substring(1));

    if (params && params["*"]) {
      params.splat = params["*"];
      delete params["*"];
    }

    let router = {
      replace: arg => wrappedNavigate(navigate, arg, true),
      push: arg => wrappedNavigate(navigate, arg, false),
      location,
      params
    };

    if (__DEV__) {
      params = deprecate.object(
        params,
        key =>
          `Accessing \`props.params.${key}\` is deprecated. Use \`props.${key}\`.`
      );

      router = deprecate.object(router, key => {
        if (key === "push") {
          return `\`props.router.push(...)\` is deprecated. Use \`props.navigate(to)\`.`;
        } else if (key === "replace") {
          return `\`props.router.replace(...)\` is deprecated. Use \`props.navigate(to, { replace: true })\`.`;
        } else if (key === "location") {
          return `\`props.router.location\` is deprecated. Use \`props.location\`.`;
        } else {
          return false;
        }
      });
    }

    return { children, params, location, router };
  };

  IndexRoute = class IndexRoute extends Route {
    static defaultProps = { path: "/" };
  };

  let isQueryIsActive = (query, activeQuery) => {
    if (activeQuery == null) return query == null;

    if (query == null) return true;

    return deepEqual(query, activeQuery);
  };

  let deepEqual = (a, b) => {
    if (a === b) return true;

    if (a == null || b == null) return false;

    if (Array.isArray(a)) {
      return (
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((item, index) => deepEqual(item, b[index]))
      );
    }

    if (typeof a === "object") {
      for (let p in a) {
        if (!Object.prototype.hasOwnProperty.call(a, p)) {
          continue;
        }

        if (a[p] === undefined) {
          if (b[p] !== undefined) {
            return false;
          }
        } else if (!Object.prototype.hasOwnProperty.call(b, p)) {
          return false;
        } else if (!deepEqual(a[p], b[p])) {
          return false;
        }
      }

      return true;
    }

    return String(a) === String(b);
  };

  let isLinkActive = (match, to, query, location, onlyActiveOnIndex) => {
    if (!match) return false;
    let queryIsActive = isQueryIsActive(query, location.query);
    if (onlyActiveOnIndex) {
      return queryIsActive && to === location.pathname;
    } else {
      return queryIsActive;
    }
  };

  CompatLink = ({
    to,
    style,
    activeStyle,
    className = "",
    activeClassName = "",
    onlyActiveOnIndex = false,
    ...props
  }) => {
    let query;
    let state;
    if (typeof to === "object") {
      query = to.query;
      state = to.state;
      to = to.pathname;
    }
    return (
      <MatchPath path={`${to}/*`}>
        {({ match, location }) => {
          let href = query ? [to, qs.stringify(query)].join("?") : to;
          let linkIsActive = isLinkActive(
            match,
            to,
            query,
            location,
            onlyActiveOnIndex
          );
          return (
            <Link
              to={href}
              state={state}
              {...props}
              style={linkIsActive ? { ...style, ...activeStyle } : style}
              className={
                isLinkActive
                  ? [className, activeClassName].join(" ").trim()
                  : className
              }
            />
          );
        }}
      </MatchPath>
    );
  };

  CompatLink.propTypes = {
    activeStyle: props => {
      if (props.activeStyle) {
        deprecate.message(
          `\`<Link to="${
            props.to
          }" activeStyle>\` is deprecated. Please wrap your Link in MatchPath. For help see: http://bit.ly/link-props`
        );
      }
    },
    activeClassName: props => {
      if (props.activeClassName) {
        deprecate.message(
          `\`<Link to="${
            props.to
          }" activeClassName>\` is deprecated. Please wrap your Link in MatchPath. For help see: http://bit.ly/link-props`
        );
      }
    },
    onlyActiveOnIndex: props => {
      if (props.activeClassName) {
        deprecate.message(
          `\`<Link to="${
            props.to
          }" onlyActiveOnIndex>\` is deprecated. Please wrap your Link in MatchPath. For help see: http://bit.ly/link-props`
        );
      }
    }
  };

  IndexLink = props => <CompatLink {...props} onlyActiveOnIndex={true} />;
  IndexLink.propTypes = {
    to: props => {
      deprecate.message(
        `\`<IndexLink to="${
          props.to
        }">\` is deprecated. Please use \`<Link>\` and wrap it in MatchPath. For help see: http://bit.ly/link-props`
      );
    }
  };

  withRouter = C => C;
}

////////////////////////////////////////////////////////////////////////
export {
  Link,
  LocationProvider,
  MatchPath,
  Redirect,
  Router,
  ServerRenderContext,
  createHistory,
  createMemorySource,
  isRedirect,
  navigate,
  redirect,
  // RRv3
  Route,
  IndexRoute,
  IndexLink,
  browserHistory,
  withRouter
};
