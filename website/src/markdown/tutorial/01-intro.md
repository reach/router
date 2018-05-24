# Tutorial Introduction

You can follow along with this tutorial with code sandbox right above this text.

```jsx
import React from "react"
import { render } from "react-dom"

const App = () => (
  <div>
    <h1>Tutorial!</h1>
  </div>
)

const Home = () => (
  <div>
    <h2>Welcome</h2>
  </div>
)

const Dashboard = () => (
  <div>
    <h2>Dashboard</h2>
  </div>
)

const Invoice = () => (
  <div>
    <h2>Invoice</h2>
  </div>
)

render(<App />, document.getElementById("root"))
```

When you navigate from step to step, the sandbox will not be affected.

**NOTE** If you navigate anywhere other than a step in the tutorial you will lose your work.

If you'd rather do it locally, we recommend using [Create React App](https://github.com/facebook/create-react-app).
