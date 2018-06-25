# Server Rendering

There are a few things to consider when server rendering your React app with Reach Router.

* Transpiling JSX for Node.js
* Providing the location statically to the app
* Handling redirects
* Data loading

## Transpiling JSX for Node.js

We aren't going to get into this, but we welcome PRs with links to documentation/tutorials that do.

## Providing the Location

This part is pretty simple, bring in `ServerLocation` and wrap your app in it. Whether you're using express or something else in Node, you'll have a `req` object somewhere with a `url` property. That's what we need.

```jsx
import { renderToString } from "react-dom/server"
import { ServerLocation } from "@reach/router"
import App from "./App"

createServer((req, res) => {
  const markup = renderToString(
    <ServerLocation url={req.url}>
      <App />
    </ServerLocation>
  )
})
```

And that's it. Instead of listening to a browser history, the routers inside the app will match against the url you provided.

## Handling Redirects

When you render a `<Redirect/>` a redirect request is thrown, preventing react from rendering the whole tree when we don't want to do that work anyway.

To handle redirects on the server, catch them, then redirect on the server.

```jsx
import { renderToString } from "react-dom/server"
import {
  ServerLocation,
  isRedirect
} from "@reach/router"
import App from "./App"

createServer((req, res) => {
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
      // carry on as usual
    }
  }
})
```

## Data Loading

When React Suspense ships, these docs will be updated with some great examples of server rendering with data loading. Until then, you'll need to come up with your own strategy.
