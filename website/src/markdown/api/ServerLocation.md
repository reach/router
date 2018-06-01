# ServerLocation

When server rendering, you need to wrap your app in a `ServerLocation`. This enables your Routers, Links, etc. to match a location on the server where there is no history to listen to.

```jsx
const App = () => (
  <Router>
    <Home path="/" />
    <Group path="/groups/:groupId" />
  </Router>
)

const markup = renderToString(
  <ServerLocation url="/groups/123">
    <App />
  </ServerLocation>
)
```

Please see the [Server Rendering Guide](../server-rendering) for the complete story on server rendering.

## url: string

The URL from the server.

```jsx
createServer((req, res) => {
  let markup = renderToString(
    <ServerLocation url={req.url} />
  )
}).listen(PORT)
```
