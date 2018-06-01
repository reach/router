# createMemorySource(initialPath)

Creates a source for [`createHistory`](createHistory) that manages a history stack in memory. Mostly for testing.

```jsx
import {
  createMemorySource,
  createHistory
} from "@reach/router"

// for some types of tests you want a memory source
let source = createMemorySource("/starting/url")
let history = createHistory(source)
```

## initialPath: string

The initial path of the history.
