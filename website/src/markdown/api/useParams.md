# useParams

Returns an object of the params for the route rendered.

This API requires a hook-compatible version of React.

```jsx
import { useParams } from "@reach/router"

// route: /user/:userName
const User = () => {
  const params = useParams();

  return <h1>{params.userName}</h1>
)
```
