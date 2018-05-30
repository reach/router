# Location

Typically you only have access to the location in Route Components, `Location` provides the location anywhere in your app with a child render prop.

```jsx
<Location>
  {props => {
    props.location
    props.navigate
  }}
</Location>

// usually folks use some destructuring
<Location>
  {({ location })=> {
    // ...
  }}
</Location>
```

The most common use case is using this to pass `location` to a `Router` for animations.

```jsx
const FadeTransitionRouter = props => (
  <Location>
    {({ location }) => (
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames="fade"
          timeout={500}
        >
          <Router location={location}>
            {props.children}
          </Router>
        </CSSTransition>
      </TransitionGroup>
    )}
  </Location>
)
```
