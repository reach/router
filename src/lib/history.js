let getLocation = source => {
  const {
    search,
    hash,
    href,
    origin,
    protocol,
    host,
    hostname,
    port
  } = source.location;
  let { pathname } = source.location;

  if (!pathname && href && canUseDOM) {
    const url = new URL(href);
    pathname = url.pathname;
  }

  return {
    pathname: encodeURI(decodeURI(pathname)),
    search,
    hash,
    href,
    origin,
    protocol,
    host,
    hostname,
    port,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial"
  };
};

let createHistory = (source, options) => {
  let listeners = [];
  let location = getLocation(source);
  let transitioning = false;
  let resolveTransition = () => {};

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

      let popstateListener = () => {
        location = getLocation(source);
        listener({ location, action: "POP" });
      };

      source.addEventListener("popstate", popstateListener);

      return () => {
        source.removeEventListener("popstate", popstateListener);
        listeners = listeners.filter(fn => fn !== listener);
      };
    },

    navigate(to, { state, replace = false } = {}) {
      if (typeof to === "number") {
        source.history.go(to);
      } else {
        state = { ...state, key: Date.now() + "" };
        // try...catch iOS Safari limits to 100 pushState calls
        try {
          if (transitioning || replace) {
            source.history.replaceState(state, null, to);
          } else {
            source.history.pushState(state, null, to);
          }
        } catch (e) {
          source.location[replace ? "replace" : "assign"](to);
        }
      }

      location = getLocation(source);
      transitioning = true;
      let transition = new Promise(res => (resolveTransition = res));
      listeners.forEach(listener => listener({ location, action: "PUSH" }));
      return transition;
    }
  };
};

////////////////////////////////////////////////////////////////////////////////
// Stores history entries in memory for testing or other platforms like Native
let createMemorySource = (initialPath = "/") => {
  // regex breakdown:
  // 1st group: `([^?#]*)` matches any character that's _not_ `?` or `#`
  // 2nd group: `(\?[^#]*)?` lazily matches a string starting with `?` including
  //  everything besides the `#` character
  // 3rd group: `(#.*)?` lazily matches everything after `#`
  //
  // NOTe: this regex should match every given string
  const match = /([^?#]*)(\?[^#]*)?(#.*)?/.exec(initialPath);
  const [pathname, search, hash] = Array.from(match).slice(1);

  let initialLocation = {
    pathname,
    search: search || "",
    hash: hash || ""
  };
  let index = 0;
  let stack = [initialLocation];
  let states = [null];

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
      pushState(state, _, uri) {
        let [pathname, search = ""] = uri.split("?");
        index++;
        stack.push({ pathname, search: search.length ? `?${search}` : search });
        states.push(state);
      },
      replaceState(state, _, uri) {
        let [pathname, search = ""] = uri.split("?");
        stack[index] = { pathname, search };
        states[index] = state;
      },
      go(to) {
        let newIndex = index + to;

        if (newIndex < 0 || newIndex > states.length - 1) {
          return;
        }

        index = newIndex;
      }
    }
  };
};

////////////////////////////////////////////////////////////////////////////////
// global history - uses window.history as the source if available, otherwise a
// memory history
let canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);
let getSource = () => {
  return canUseDOM ? window : createMemorySource();
};

let globalHistory = createHistory(getSource());
let { navigate } = globalHistory;

////////////////////////////////////////////////////////////////////////////////
export { globalHistory, navigate, createHistory, createMemorySource };
