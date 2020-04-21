# Route Component

Any component passed as a child to `<Router>` is called a "Route Component". There are three types of props for Route Components.

1.  **Matching Props** - You provide these props where the `<Router>` is rendered. They are used by `Router` to match the component against the location to see if the component should be rendered. But, they're not really all that important to the component itself. Think of these like the `key` prop in React. Your component doesn't really care about it, but it's information React needs in the parent.

2.  **Route Props** - These props are passed to your component by `Router` when your component matches the URL: URL parameters and `navigate` are a couple of them. They are all documented on this page.

3.  **Other Props** - Route Components are your own components so go ahead and pass them whatever props they need.

## path: string

<p class="category">matching prop</p>

Used to match your component to the location. When it matches, the component will be rendered.

```jsx
<Router>
  <Home path="/" />
  <Dashboard path="dashboard" />
</Router>
```

At "/", Router will render `<Home/>`. At "/dashboard", Router will render `<Dashboard/>`.

### URL Parameters with Dynamic Segments

You can make a segment dynamic with `:someName`. Router will parse the value out of the URL and pass it to your component as a prop by the same name.

```jsx
<Router>
  <Dashboard path="dashboard" />
  <Invoice path="invoice/:invoiceId" />
</Router>
```

At "invoice/10023", Router will render `<Invoice invoiceId="10023"/>`.

**Reserved Names**: You can name your parameters anything want except `uri` and `path`. You'll get a warning if you try, so don’t worry if you didn’t actually read these docs (... 🤔).

### Trailing Wildcard

If you'd like to match a path with optional extra segments, use the wild card on the end of your path: `/*`.

```jsx
<Router>
  <Admin path="admin/*" />
</Router>
```

This is useful for embedded Routers. Perhaps Admin renders its own router, we use the wildcard to make sure the deeper routes in the parent router match the `Admin` component.

```jsx
render(
  <Router>
    <Admin path="admin/*" />
  </Router>
)

const Admin = () => (
  <div>
    <p>A nested router</p>
    <Router>
      <AdminGraphs path="/" />
      <Users path="users" />
      <Settings path="settings" />
    </Router>
  </div>
)
```

The wildcard portion of the url will be found on `props["*"]` in your Route Component.

```jsx
render(
  <Router>
    <FileBrowser path="files/*" />
  </Router>
)

const FileBrowser = props => {
  let filePath = props["*"]
  // URL: "/files/taxes/2018"
  // filePath === "taxes/2018"
}
```

You can also name the wildcard portion with suffix.

```jsx
render(
  <Router>
    <FileBrowser path="files/*filePath" />
  </Router>
)

const FileBrowser = props => {
  let filePath = props.filePath
  // URL: "/files/taxes/2018"
  // filePath === "taxes/2018"
}
```

## path: "/" (Index Routes)

<p class="category">matching prop</p>

If you pass `/` as the path to a route component, we call this an "Index Route". It will match at the parent's path. Much like an `index.html` on a static file server.

```jsx
// at the url "/orders"
// `OrderSummary` will render inside of `Orders`
<Router>
  <Orders path="orders">
    <OrdersSummary path="/" />
    <Order path=":orderId" />
  </Orders>
</Router>
```

At "/orders" Router will render `<Orders><OrdersSummary /></Orders>`. At "/orders/33" Router will render `<Orders><Order orderId="33" /></Orders>`.

## default: bool

<p class="category">matching prop</p>

When no children match, a route component with a `default` prop will render. Think of this like a 404 on the server.

```jsx
<Router>
  <NotFound default />
  <Orders path="orders" />
  <Settings path="settings" />
</Router>
```

---

## children: elements

<p class="category">route prop</p>

When Route Components are nested, the matching child is passed in as `props.children`. If ever you think `Router` isn't working, make sure you rendered `props.children`!

```jsx
// note that `Root` has child routes
const App = () => (
  <Router>
    <Root path="/">
      <Orders path="orders" />
      <Settings path="settings" />
      <NotFound default />
    </Root>
  </Router>
)

// so we need to render `props.children` to see them
const Root = props => (
  <div>
    <Nav />
    <main>{props.children}</main>
  </div>
)
```

## \[:param\]: string

<p class="category">route prop</p>

Any params in your component's path will be parsed and passed to your component as a prop by the same name.

```jsx
const App = () => (
  <Router>
    <Event path="events/:eventId" />
  </Router>
)

// at /events/taco-party
// props.eventId will be "taco-party"
const Event = props => <div>{props.eventId}</div>
```

## location: object

<p class="category">route prop</p>

The location of the app. Typically you don't need this, but you can log it and see what there is to look at!

## navigate(to, { state={}, replace=false })

<p class="category">route prop</p>

A version of [navigate](navigate) that supports relative paths.

```jsx
const NewInvoice = props => (
  <form
    onSubmit={event => {
      event.preventDefault()
      // do stuff w/ the form
      props.navigate("somewhere-relative")
    }}
  >
    {/* ... */}
  </form>
)

const App = () => (
  <Router>
    <NewInvoice path="invoices/new" />
  </Router>
)
```

## uri: string

<p class="category">route prop</p>

The portion of the URL that matched a parent route.

```jsx
// URL: /user/napoleon/grades

const App = () => (
  <Router>
    <User path="user/:userId">
      <Grades path="grades" />
    </User>
  </Router>
)

const User = props => (
  // props.uri === "/user/napoleon"
  <div>{props.children}</div>
)

const Grades = props => (
  // props.uri === "/user/napoleon/grades"
  <div>...</div>
)
```

---

## Other

These are your own components, so you can pass whatever props you'd like to pass to them, even stuff from the state of the owner component.

```jsx
class App extends React.Component {
  state = { tacos: null }

  componentDidMount() {
    fetchTacos().then(tacos => {
      this.setState({ tacos })
    })
  }

  render() {
    return (
      <Router>
        <User path="users/:userId" />
        <User
          path="users/:userId/edit"
          // can use the User component for both
          // the viewing and editing screens
          edit={true}
        />
        <User
          path="users/me"
          // what would be a param for
          // "/users/:userId" can be passed
          // as a normal prop for special
          // urls
          userId={window.USER_ID}
        />
        <Tacos
          path="tacos"
          // can pass your state and things will
          // update as expected
          allTacos={this.state.tacos}
        />
      </Router>
    )
  }
}
```
