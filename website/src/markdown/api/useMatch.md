# useMatch

Matches a path to the location. Matching is relative to any parent Routers, but not parent match's, because they render even if they don't match.

This API requires a hook-compatible version of React.

```jsx
import { useMatch } from "@reach/router"

const App = () => {
  const match = useMatch('/hot/:item');

  return match ? (
    <div>Hot {match.item}</div>
  ) : (
    <div>Uncool</div>
  )
)
```

`useMatch` will return `null` if your path does not match the location. If it does match it will contain:

- `uri`
- `path`
- `:params`

## match\[param\]: string

Any params in your the path will be parsed and passed as `match[param]` to your callback.

```jsx
const match = useMatch("events/:eventId")

props.match ? props.match.eventId : "No match"
```

## match.uri: string

The portion of the URI that matched. If you pass a wildcard path, the wildcard portion will not be included. Not sure how this is useful for a `Match`, but it's critical for how focus managment works, so we might as well pass it on to Match if we pass it on to Route Components!

```jsx
// URL: /somewhere/deep/i/mean/really/deep
const match = useMatch("/somewhere/deep/*")

return <div>{match.uri}</div>
```

## match.path: string

The path you passed in as a prop.
