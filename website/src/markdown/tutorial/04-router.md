# Tutorial - Router

Next we import [Router](../api/Router), render it, and render our [Route Components](../api/RouteComponent) as children. All that's left is to add a `path` prop to each child.

```jsx
import { Link, Router } from "@reach/router"

// under the `nav`
<Router>
  <Home path="/" />
  <Dashboard path="/dashboard" />
</Router>
```
