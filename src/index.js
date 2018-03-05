/*eslint-disable jsx-a11y/anchor-has-content */
import React, { Children, createContext, cloneElement } from "react";
import ReactDOM from "react-dom";
import warning from "warning";
import invariant from "invariant";
import resolveUrl from "resolve-url";
import Component from "react-component-component";
const globalHistory = createHistory();

////////////////////////////////////////////////////////////////////////
// Public Components

const Router = ({ children, basepath = "/" }) => (
  <HistoryContext.Consumer>
    {history => (
      <Location>
        {location => (
          <Component
            location={location}
            didUpdate={({ props, prevProps }) => {
              // though Routers can be nested, the innermost is the only one
              // that calls this as the parents will bail because `transitioning` has
              // been updated
              if (history.transitioning) {
                if (props.location !== prevProps.location) {
                  history._onTransitionComplete();
                }
              }
            }}
          >
            {() => {
              const routes = Children.map(
                children,
                makeRouteFromChild(basepath)
              );
              const match = getMatchingRoute(location, routes);
              warnIfNoMatch(basepath, match, routes, location);
              if (!match) return null;
              const { element, params, url } = match;
              return (
                <BaseUrlContext.Provider value={url}>
                  {cloneElement(
                    element,
                    {
                      ...params,
                      url,
                      location,
                      navigate: history.navigate
                    },
                    element.props.children ? (
                      <Router basepath={`${element.props.path}`}>
                        {element.props.children}
                      </Router>
                    ) : null
                  )}
                </BaseUrlContext.Provider>
              );
            }}
          </Component>
        )}
      </Location>
    )}
  </HistoryContext.Consumer>
);

const Link = ({ to, state, onTransition, ...props }) => (
  <HistoryContext.Consumer>
    {({ navigate }) => (
      <BaseUrlContext.Consumer>
        {basepath => {
          const href = makeRelativeHref(to, basepath);
          return (
            <a
              {...props}
              href={href}
              onClick={event => {
                if (props.onClick) props.onClick(event);
                if (shouldNavigate(event)) {
                  event.preventDefault();
                  navigate({ to: href, state }).then(() => {
                    onTransition && onTransition();
                  });
                }
              }}
            />
          );
        }}
      </BaseUrlContext.Consumer>
    )}
  </HistoryContext.Consumer>
);

const Match = ({ path, children }) => (
  <HistoryContext.Consumer>
    {({ navigate }) => (
      <Location>
        {location => {
          const match = getMatch(location, { path });
          return children({ navigate, match, location });
        }}
      </Location>
    )}
  </HistoryContext.Consumer>
);

const Redirect = () => null;

const LocationProvider = ({
  history = globalHistory,
  children = null
}) => (
  <Component
    initialState={{ location: { ...history.location }, unlisten: null }}
    didMount={({ setState, state }) => {
      state.unlisten = history.listen(() => {
        ReactDOM.unstable_deferredUpdates(() => {
          setState(() => ({
            location: { ...history.location }
          }));
        });
      });
    }}
    willUnmout={({ state }) => {
      state.unlisten();
    }}
    render={({ state }) => (
      <LocationContext.Provider value={state.location}>
        {typeof children === "function"
          ? children(state.location)
          : children}
      </LocationContext.Provider>
    )}
  />
);

const Location = ({ children }) => (
  <LocationContext.Consumer>
    {location =>
      location ? (
        children(location)
      ) : (
        <LocationProvider>{children}</LocationProvider>
      )
    }
  </LocationContext.Consumer>
);

const navigate = (...args) => globalHistory.navigate(...args);

//////////////////////////////////////////////////////////////
// Private components

const LocationContext = createContext();

const HistoryContext = createContext(globalHistory);

const BaseUrlContext = React.createContext();

//////////////////////////////////////////////////////////////
// component utils
const isRootPath = path => path === "/";

const makeRouteFromChild = basepath => child => {
  invariant(
    child.props.path || child.props.default,
    `<Router>: Children of <Router> must have a \`path\` or \`default\` prop. None found on element type \`${
      child.type
    }\``
  );
  const childPath = child.props.path;
  const path = isRootPath(basepath)
    ? childPath
    : isRootPath(childPath)
      ? // use parent path if child is root
        basepath
      : `${basepath}/${childPath}`;

  return {
    element: child,

    // these two props are used in the path matching code
    default: child.props.default,
    path: child.props.children
      ? `${path}/*` // ensure child routes match
      : path
  };
};

const getMatchingRoute = (location, routes) => {
  let result = null;
  rankRoutes(routes)
    .sort(pathRankSort)
    .forEach(route => {
      if (result) return;
      if (route.default) {
        result = { element: route.element };
      } else {
        const match = getMatch(location, route);
        if (match) {
          result = { element: route.element, ...match };
        }
      }
    });
  return result;
};

const warnIfNoMatch = (basepath, match, routes, location) => {
  warning(
    !(basepath === "" && !match),
    `<Router> Nothing matched \`${
      location.pathname
    }\`. Paths checked: ${routes
      .filter(route => route.path)
      .map(route => `"${route.path}"`)
      .join(", ")}. You should add \`<NotFound default/>\`.`
  );
};

const makeRelativeHref = (to, basepath) => {
  if (basepath == null || basepath === "" || basepath === "/") {
    return to;
  } else {
    return resolveUrl(basepath + "/", to);
  }
};

const shouldNavigate = event =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

//////////////////////////////////////////////////////////////
// History management

function createHistory() {
  let listeners = [];
  let location = { ...window.location };
  let transitioning = false;
  let resolveTransition = null;

  return {
    get location() {
      return location;
    },

    get transitioning() {
      return transitioning;
    },

    _onTransitionComplete() {
      transitioning = false;
      resolveTransition();
    },

    listen(listener) {
      listeners.push(listener);

      const popstateListener = () => {
        location = { ...window.location };
        listener();
      };

      window.addEventListener("popstate", popstateListener);

      return () => {
        window.removeEventListener("popstate", popstateListener);
        listeners = listeners.filter(fn => fn !== listener);
      };
    },

    navigate(pathOrOptions) {
      const args =
        typeof pathOrOptions === "string"
          ? { path: pathOrOptions }
          : pathOrOptions;
      const { to, replace = false, state = null } = args;

      if (transitioning || replace) {
        window.history.replaceState(state, null, to);
      } else {
        window.history.pushState(state, null, to);
      }
      location = { ...window.location };
      transitioning = true;
      listeners.forEach(fn => fn());
      return new Promise(res => {
        resolveTransition = res;
      });
    }
  };
}

////////////////////////////////////////////////////////////////////////
// Path matching/ranking

/*!
Path matching/parsing/ranking adapted from Preact Router
https://github.com/developit/preact-router
The MIT License (MIT)
Copyright (c) 2015 Jason Miller
*/

const segmentize = pathname => {
  return pathname.replace(/(^\/+|\/+$)/g, "").split("/");
};

const rankSegment = segment => {
  return segment.charAt(0) === ":"
    ? 1 + "*?".indexOf(segment.charAt(segment.length - 1)) || 4
    : 5;
};

const rank = route => {
  return segmentize(route.path)
    .map(rankSegment)
    .join("");
};

const rankRoute = route => {
  return route.default ? 0 : rank(route);
};

const rankRoutes = routes => {
  return routes.map((route, index) => {
    return {
      ...route,
      index,
      rank: rankRoute(route)
    };
  });
};

const pathRankSort = (a, b) => {
  return a.rank < b.rank ? 1 : a.rank > b.rank ? -1 : a.index - b.index;
};

const getMatch = (location, route) => {
  let ret;
  let c = 0;
  const params = {};

  const pathname = segmentize(location.pathname);
  const path = segmentize(route.path || "");

  const max = Math.max(pathname.length, path.length);
  const dynamicChars = [":", "*"];

  for (let i = 0; i < max; i++) {
    if (path[i] && dynamicChars.includes(path[i].charAt(0))) {
      let param = path[i].replace(/(^:|[*?]+$)/g, "");
      const flags = (path[i].match(/[*?]+$/) || {})[0] || "";
      const star = ~flags.indexOf("*");
      const val = pathname[i] || "";
      if (star) param = "*";

      if (!val && !star && flags.indexOf("?") < 0) {
        ret = false;
        break;
      }

      params[param] = decodeURIComponent(val);

      if (star) {
        params[param] = pathname
          .slice(i)
          .map(decodeURIComponent)
          .join("/");
        break;
      }
    } else if (path[i] !== pathname[i]) {
      ret = false;
      break;
    }
    c++;
  }

  if (route.default !== true && ret === false) return undefined;

  return {
    params,
    path: route.path,
    url: `/${pathname.slice(0, c).join("/")}`
  };
};

/*!
End of Preact Router adaptation
*/

////////////////////////////////////////////////////////////////////////
// Exports
export {
  Router,
  Link,
  Redirect,
  Match,
  History,
  LocationProvider,
  navigate
};
