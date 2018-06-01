# redirectTo(uri)

React 16+ only. For React < 16 use [`navigate`](navigate) or [Redirect](Redirect).

Imperatively redirects to a new location by throwing a redirect request.

```jsx
import { redirectTo } from "@reach/router"

class User extends React.Component {
  componentDidMount() {
    fetchUser().then(user => {
      if (user.optedIntoNewUI) {
        redirectTo("/the/new/digs")
      }
    })
  }

  // ...
}
```

## uri: string

The uri to redirect to. Must be absolute, it does not support relative paths.

```jsx
redirectTo("/somewhere/else")
```
