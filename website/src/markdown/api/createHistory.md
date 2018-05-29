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
