/*eslint-disable jsx-a11y/anchor-has-content */
import React, { Children, cloneElement } from "react";
import warning from "warning";
import invariant from "invariant";
import createContextPolyfill from "create-react-context";
import ReactDOM from "react-dom";
import { pick, resolve, match } from "./utils";

////////////////////////////////////////////////////////////////////////
// React polyfills
let { createContext } = React;
if (createContext === undefined) {
  createContext = createContextPolyfill;
}

let { unstable_deferredUpdates } = ReactDOM;
if (unstable_deferredUpdates === undefined) {
  unstable_deferredUpdates = fn => fn();
}

////////////////////////////////////////////////////////////////////////
// history management
let createHistory = source => {
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
};

let createMemorySource = (initialPathname = "/") => {
  let index = 0;
  let stack = [{ pathname: initialPathname }];
  let states = [];

  return {
    get location() {
      return stack[index];
    },
    addEventListener(name, fn) {},
    removeEventListener(name, fn) {},
    history: {
      get entries() {
        return stack;
      },
      get index() {
        return index;
      },
      get state() {
        return states[index];
      },
      pushState(state, _, pathname) {
        index++;
        stack.push({ pathname });
        states.push(state);
      },
      replaceState(state, _, pathname) {
        stack[index] = { pathname };
        states[index] = state;
      }
    }
  };
};

////////////////////////////////////////////////////////////////////////
// global history
let getSource = () => {
  let canUseDOM = !!(
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
  );
  return canUseDOM ? window : createMemorySource();
};

let globalHistory = createHistory(getSource());
let { navigate } = globalHistory;

////////////////////////////////////////////////////////////////////////
// Location
let LocationContext = createContext();

let withLocation = Comp => props => (
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
        {typeof children === "function"
          ? children(context)
          : children || null}
      </LocationContext.Provider>
    );
  }
}

////////////////////////////////////////////////////////////////////////
// Base URI context
let BaseUriContext = createContext();
let withBaseUri = Comp => props => (
  <BaseUriContext.Consumer>
    {baseUri => <Comp {...props} baseUri={baseUri} />}
  </BaseUriContext.Consumer>
);

////////////////////////////////////////////////////////////////////////
// Router
let Router = withBaseUri(
  withLocation(
    ({ location, navigate, basepath, baseUri, children }) => {
      basepath = basepath || baseUri || "/"; // prop > context > default
      let routes = Children.map(children, createRoute(basepath));
      let match = pick(routes, location.pathname);
      if (match) {
        let { params, uri, route, route: { value: element } } = match;
        let props = { ...params, uri, location };
        let clone = cloneElement(
          element,
          props,
          element.props.children ? (
            <Router basepath={route.path.replace(/\/\*$/, "")}>
              {element.props.children}
            </Router>
          ) : (
            undefined
          )
        );
        return (
          <BaseUriContext.Provider value={uri}>
            {clone}
          </BaseUriContext.Provider>
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
    }
  )
);

////////////////////////////////////////////////////////////////////////
// Link
let Link = withBaseUri(
  withLocation(
    ({ baseUri, navigate, to, state, replace, ...anchorProps }) => {
      const href = resolve(to, baseUri);
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
    }
  )
);

////////////////////////////////////////////////////////////////////////
// Redirect
let Redirect = withLocation(
  class Redirect extends React.Component {
    componentDidMount() {
      const { props: { navigate, to, replace = true, state } } = this;
      navigate(to, { replace, state });
    }
    render() {
      // TODO: throw a redirect with Suspense to prevent ever even rendering
      // down this far
      return null;
    }
  }
);

////////////////////////////////////////////////////////////////////////
// MatchPath
let MatchPath = withLocation(
  ({ path, location, navigate, children }) => {
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
  }
);

////////////////////////////////////////////////////////////////////////
// helpers
let stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");

let createRoute = basepath => element => {
  invariant(
    element.props.path ||
      element.props.default ||
      element.type === Redirect,
    `<Router>: Children of <Router> must have a \`path\` or \`default\` prop, or be a \`<Redirect>\`. None found on element type \`${
      element.type
    }\``
  );

  let elementPath =
    element.type === Redirect ? element.props.from : element.props.path;

  let path =
    elementPath === "/"
      ? basepath
      : `${basepath}/${stripSlashes(elementPath)}`;

  return {
    value: element,
    default: element.props.default,
    path: element.props.children ? `${path}/*` : path
  };
};

const shouldNavigate = event =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

////////////////////////////////////////////////////////////////////////
// exports
export {
  createHistory,
  createMemorySource,
  navigate,
  LocationProvider,
  Router,
  Link,
  Redirect,
  MatchPath
};
