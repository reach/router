# Match

Matches a path to the location and calls back with a match or null. Matching is relative to any parent Routers, but not parent Match's, because they render even if they don't match.

```jsx
import { Match } from "@reach/router"

const App = () => (
  <Match path="/hot/:item">
    {props =>
      props.match ? (
        <div>Hot {props.match.item}</div>
      ) : (
        <div>Uncool</div>
      )
    }
  </Match>
)
```

## props.match: object

Will be null if your path does not match the location. If it does match it will contain:

* `uri`
* `path`
* `:params`

```jsx
<Match path="/cool/beans">
  {props =>
    props.match ? (
      <div>Cool beans</div>
    ) : (
      <div>Uncool</div>
    )
  }
</Match>
```

## props.match\[param\]: string

Any params in your the path will be parsed and passed as `match[param]` to your callback.

```jsx
<Match path="events/:eventId">
  {props => (
    <div>
      {props.match
        ? props.match.eventId
        : "No match"}
    </div>
  )}
</Match>
```

## props.match.uri: string

The portion of the URI that matched. If you pass a wildcard path, the wildcard portion will not be included. Not sure how this is useful for a `Match`, but it's critical for how focus managment works, so we might as well pass it on to Match if we pass it on to Route Components!

```jsx
// URL: /somewhere/deep/i/mean/really/deep
<Match path="/somewhere/deep/*">
  {props => (
    // props.match.uri === "/somewhere/deep"
    <div>{props.match.uri}</div>
  )}
</Match>
```

## props.match.path: string

The path you passed in as a prop.

## props.location: object

The location of the app. Typically you don't need this, but you can log it and see what there is to look at!

## navigate(to, { state={}, replace=false })

A version of [navigate](navigate) that does not support relative paths because we might not be matching anything to be relative to.
