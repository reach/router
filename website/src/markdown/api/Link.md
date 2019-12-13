# Link

Provides accessible navigation.

```jsx
import { Link } from '@reach/router'

<Link to="somewhere">Anywhere</Link>
```

## to: string

The string URI to link to. Supports relative and absolute URIs.

```jsx
<Link to="relative">Relative</Link>
<Link to="/absolute">Absolute</Link>
<Link to="?relative=query&sure=why+not">Relative query</Link>
<Link to="../back-up">Back up</Link>
```

Please see the [Nesting](../nesting) guide to know how to appropriately use relative links.

## replace: bool

If `true`, the latest entry on the history stack will be replaced with a new one. Use this when you don't want the previous page to show up when the user clicks the back button.

```jsx
<Link to="?query=some+new+query" replace />
```

## ref: func

If using React >=16.4, `Link` will forward its ref to you.

```jsx
<Link to="./" ref={node => /* ... */} />
```

## innerRef: func

Calls up with its inner ref for apps on React <16.4. If using React >=16.4, use `ref` instead.

```jsx
<Link to="./" innerRef={node => /* ... */} />
```

## getProps: func(obj)

Calls up to you to get props for the underlying anchor element. Useful for styling the anchor as active.

Argument `obj` Properties:

- `isCurrent` - true if the `location.pathname` is exactly the same as the anchor's href.
- `isPartiallyCurrent` - true if the `location.pathname` starts with the anchor's href.
- `href` - the fully resolved href of the link.
- `location` - the app's location.

```jsx
// this is only active when the location pathname is exactly
// the same as the href.
const isActive = ({ isCurrent }) => {
  return isCurrent ? { className: "active" } : {}
}

const ExactNavLink = props => (
  <Link getProps={isActive} {...props} />
)

// this link will be active when itself or deeper routes
// are current
const isPartiallyActive = ({
  isPartiallyCurrent
}) => {
  return isPartiallyCurrent
    ? { className: "active" }
    : {}
}

const PartialNavLink = props => (
  <Link getProps={isPartiallyActive} {...props} />
)
```

## state: object

An object to put on location state.

```jsx
const NewsFeed = () => (
  <div>
    <Link
      to="photos/123"
      state={{ fromFeed: true }}
    />
  </div>
)

const Photo = ({ location, photoId }) => {
  if (location.state.fromFeed) {
    return <FromFeedPhoto id={photoId} />
  } else {
    return <Photo id={photoId} />
  }
}
```

## others

You can also pass props you'd like to be on the `<a>` such as a `title`, `id`, `className`, etc.

```jsx
<Link
  to="somewhere"
  className="whatev"
  onClick={youBet}
/>
```
