/*eslint-disable jsx-a11y/anchor-has-content */
import React, { Children, cloneElement } from "react";
import createContextPolyfill from "create-react-context";
import ReactDOM from "react-dom";
import warning from "warning";
import invariant from "invariant";
import Component from "@reactions/component";
import { pick, match, resolve } from "./utils";
const globalHistory = createHistory();

let { createContext } = React;
if (createContext === undefined) {
  createContext = createContextPolyfill;
}

let { unstable_deferredUpdates } = ReactDOM;
if (unstable_deferredUpdates === undefined) {
  unstable_deferredUpdates = fn => fn();
}

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
              const match = pick(routes, location.pathname);
              warnIfNoMatch(basepath, match, routes, location);
              if (!match) return null;
              const { params, uri, value: { element } } = match;
              return (
                <BaseUrlContext.Provider value={uri}>
                  {cloneElement(
                    element,
                    {
                      ...params,
                      uri,
                      location,
                      navigate: (to, options) =>
                        history.navigate(resolve(to, basepath), options)
                    },
                    element.props.children ? (
                      <Router
                        basepath={`${match.path.replace(/\*$/, "")}`}
                      >
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

const Link = ({ to, state, replace, onTransition, ...props }) => (
  <HistoryContext.Consumer>
    {({ navigate }) => (
      <BaseUrlContext.Consumer>
        {basepath => {
          const href = resolve(to, basepath);
          return (
            <a
              {...props}
              href={href}
              onClick={event => {
                if (props.onClick) props.onClick(event);
                if (shouldNavigate(event)) {
                  event.preventDefault();
                  navigate(href, { state, replace }).then(() => {
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
          return children({
            navigate,
            match: match(location, { pattern: path }),
            location
          });
        }}
      </Location>
    )}
  </HistoryContext.Consumer>
);

const Redirect = ({ to }) => (
  <Location>
    {({ navigate }) => <Component didMount={() => navigate(to)} />}
  </Location>
);

const LocationProvider = ({ history = globalHistory, children }) => (
  <Component
    initialState={{
      location: { ...history.location },
      refs: { unlisten: null }
    }}
    didMount={({ setState, state }) => {
      state.refs.unlisten = history.listen(() => {
        unstable_deferredUpdates(() => {
          setState(() => ({
            location: { ...history.location }
          }));
        });
      });
    }}
    willUnmout={({ state }) => {
      state.refs.unlisten();
    }}
    render={({ state }) => (
      <LocationContext.Provider value={state.location}>
        <HistoryContext.Provider value={history}>
          {typeof children === "function"
            ? children(state.location)
            : children}
        </HistoryContext.Provider>
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

const BaseUrlContext = createContext();

//////////////////////////////////////////////////////////////
// component utils
const isRootPath = path => path === "/";

const makeRouteFromChild = basepath => child => {
  invariant(
    child.props.path || child.props.default || child.type === Redirect,
    `<Router>: Children of <Router> must have a \`path\` or \`default\` prop, or be a <Redirect>. None found on element type \`${
      child.type
    }\``
  );
  const childPath =
    child.type === Redirect ? child.props.from : child.props.path;
  const path = isRootPath(basepath)
    ? childPath // avoid "/" + "/child"
    : isRootPath(childPath) // avoid "/" + "/"
      ? basepath
      : `${basepath}/${childPath}`;

  return {
    value: { element: child },
    // these props are used in the path matching code
    default: child.props.default,
    pattern: child.props.children
      ? `${path}/*` // ensure child routes match
      : path
  };
};

const warnIfNoMatch = (basepath, match, routes, location) => {
  warning(
    !!match,
    `<Router> Nothing matched \`${
      location.pathname
    }\`. Paths checked: ${routes
      .filter(route => route.path)
      .map(route => `"${route.path}"`)
      .join(", ")}. You should add \`<NotFound default/>\`.`
  );
};

const shouldNavigate = event =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

//////////////////////////////////////////////////////////////
// History management

function createHistory(source = window) {
  let listeners = [];
  let location = { ...source.location };
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
        location = { ...source.location };
        listener();
      };

      source.addEventListener("popstate", popstateListener);

      return () => {
        source.removeEventListener("popstate", popstateListener);
        listeners = listeners.filter(fn => fn !== listener);
      };
    },

    navigate(to, { state = null, replace = false } = {}) {
      if (transitioning || replace) {
        source.history.replaceState(state, null, to);
      } else {
        source.history.pushState(state, null, to);
      }

      location = { ...source.location };
      transitioning = true;
      const transition = new Promise(res => {
        resolveTransition = res;
      });
      listeners.forEach(fn => fn());
      return transition;
    }
  };
}

////////////////////////////////////////////////////////////////////////
// Exports
export {
  Router,
  Link,
  Redirect,
  Match,
  History,
  LocationProvider,
  createHistory,
  navigate
};
