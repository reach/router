# useNavigate

If you need to navigate programmatically (like after a form submits), this hook gives you an API to do so with a signature like this:

```js
navigate(to, { state={}, replace=false })
```

This API requires a hook-compatible version of React.

```jsx
import { useNavigate } from "@reach/router"

const AnalyticTracker = (props) => {
  const navigate = useNavigate();

  return (
    <form onSubmit={() => navigate('../', { replace: true })}>
      {...}
    </form>
  )
)
```
