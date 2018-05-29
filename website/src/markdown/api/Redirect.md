# Redirect

Redirects from one path to another. Use this when you want to change a URL without breaking links to the old path.

```jsx
<Router>
  <Redirect from="aboutus" to="about-us" />
  <AboutUs path="about-us" />

  <Redirect
    from="users/:userId"
    to="profile/:userId"
  />
  <Profile path="profile/:userId" />
</Router>
```

It doesn't have to be a child of a Router, it can also be rendered anywhere in your app when you want to declaratively redirect.

```jsx
class Home extends React.Component {
  state = {
    user: null
  }

  async componentDidMount() {
    let user = await fetchUser()
    this.setState({ user })
  }

  render() {
    if (this.state.user.hasBetaEnabled) {
      return <Redirect to="/all/new/stuff" />
    } else {
      return <NormalPage />
    }
  }
}
```

## from: string

Only used when rendered inside of a `<Router>`. This indicates which path to redirect from, note the parameters must match the `to` prop's parameters.

```jsx
<Redirect
  from="users/:userId"
  to="profile/:userId"
/>
```

## to: string

This indicates which path to redirect to, note the parameters must match the `from` prop's parameters.

```jsx
<Redirect
  from="users/:userId"
  to="profile/:userId"
/>
```

## noThrow

```jsx
<Redirect noThrow />
```

Redirect works with `componentDidCatch` to prevent the tree from rendering and starts over with a new location.

Because React doesn't swallow the error this might bother you. For example, a redirect will trigger Create React App's error overlay. In production, everything is fine. If it bothers you, add `noThrow` and Redirect will do redirect without using `componentDidCatch`.

If you're using React < 16 Redirect will not throw at all, regardless of what value you put for this prop.

If you're using `componentDidCatch` in your app please read the [isRedirect](isRedirect) doc!
