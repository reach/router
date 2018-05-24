# Tutorial - Default Routes

When users end up at a URL that doesn't match any of your routes we'd like to indicate that, just like a 404. We accomplish this with a Default Route.

First create a new component to render:

```jsx
const NotFound = () => <p>Sorry, nothing here</p>
```

Next, add it to `<Router>` with a `default` prop. This indicates to `Router` that it should be rendered if no match is found.

```jsx
<Router>
  <NotFound default />
  {/*...*/}
</Router>
```

Now type some random junk into the URL, like "/flakjsd" and you'll see the `NotFound` component renders.
