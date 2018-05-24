# Tutorial - Link

The first thing we want to do is add a Link. Here we import it, and then render a couple of them. Go ahead and click them and watch the URL change. This is the primary way users navigate around your app.

```jsx
import { Link } from "@reach/router";

// ...
<h1>Tutorial!</h1>
<nav>
  <Link to="/">Home</Link>{" "}
  <Link to="dashboard">Dashboard</Link>
</nav>
```
