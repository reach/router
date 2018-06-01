# isRedirect(error)

Returns true if the error is a redirect request. Useful for server rendering and rethrowing errors in `componentDidCatch`.

## componentDidCatch

If you're using `componentDidCatch` in your app you _must_ check if the error is a redirect, and if it is, rethrow it, otherwise the app will not redirect. Even better, you should check if the error is the kind you want to catch and rethrow if not.

```jsx
import { isRedirect } from "@reach/router"

class Decent extends React.Component {
  componentDidCatch(error) {
    if (isRedirect(error)) {
      throw error
    } else {
      // do whatever you were going to do
    }
  }
}
```

Maybe one day we'll get pattern matching and a two-pass try/catch but those are just dreams in Sebastian Markbåge's head.

## Server Rendering

If your app redirects while server rendering it will throw an error. Use `isRedirect` to decide how to handle the error. If it's a redirect, then redirect on your server, otherwise do what you normally do with errors.

```jsx
let markup
try {
  markup = renderToString(
    <ServerLocation url={req.url}>
      <App />
    </ServerLocation>
  )
} catch (error) {
  if (isRedirect(error)) {
    res.redirect(error.uri)
  } else {
    // ..
  }
}
```

Please see the [Server Rendering](../server-rendering) doc for the full server rendering story.
