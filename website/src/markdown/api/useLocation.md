# useLocation

Returns the location to any component.

This API requires a hook-compatible version of React.

```jsx
import { useLocation } from "@reach/router"

const useAnalytics = (props) => {
  const location = useLocation();

  useEffect(() => {
    ga.send(['pageview', location.pathname]);
  }, [])
)
```
