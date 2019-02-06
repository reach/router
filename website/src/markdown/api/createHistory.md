# createHistory(source)

Creates a history object that enables you to listen for location changes. You don't typically need this outside of some types of testing.

```jsx
import {
  createMemorySource,
  createHistory
} from "@reach/router"

// listen to the browser history
let history = createHistory(window)

// for some types of tests you want a memory source
let source = createMemorySource("/starting/url")
let history = createHistory(source)
```

There may be times within your screen where you may need to change a part of the
UI based on some query param. By default we do not parse the search property of the source `location`. To do so we allow you to pass in a custom `getLocation` function into
the options object. For example:

```jsx
import {
  createMemorySource,
  createHistory
} from "@reach/router"

let options = {
  getLocation(source) {
    const query = new URLSearchParams(
      source.location.search
    )

    return {
      ...source.location,
      query,
      state: source.history.state,
      key:
        (source.history.state &&
          source.history.state.key) ||
        "initial"
    }
  }
}

// listen to the browser history
let history = createHistory(window, options)
```
