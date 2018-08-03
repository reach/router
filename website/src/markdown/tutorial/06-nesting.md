# Tutorial - Nesting

The child Route Components of Router can have their own children, then all the paths and links will nest automatically.

Let's create another component called `Invoices` that keeps a persistent set of links to our invoices. Do note the `props.children`, we'll talk more about that in a second.

```jsx
const Invoices = props => (
  <div>
    <h2>Invoices</h2>
    <ul>
      <li>
        <Link to="/invoices/123">Invoice 123</Link>
      </li>
      <li>
        <Link to="/invoices/abc">Invoice ABC</Link>
      </li>
    </ul>

    {props.children}
  </div>
)
```

Next, add it to the `<Router>` and move the `Invoice` component into it as a child. Note that we've changed the `Invoice` path from `invoices/:invoiceId` to just `:invoiceId`. The paths nest automatically.

```jsx
<Router>
  <Invoices path="invoices">
    <Invoice path=":invoiceId" />
  </Invoices>
  {/*...*/}
</Router>
```

Now in `App`, link to `invoices` instead of individual invoices.

```jsx
<nav>
  <Link to="/">Home</Link>{" "}
  <Link to="dashboard">Dashboard</Link>{" "}
  <Link to="invoices">Invoices</Link>
</nav>
```

Go click around. Note that when you're at `/invoices` we see just the links, but when you click on a link to `/invoices/abc` we see the individual `Invoice` nested inside `Invoices`.

The child route components that match the URL will be passed to the parent component as `props.children`. This makes it really easy to add persistent navigation at any level of the hierarchy.

We can take this nesting a step further. Go to your links and remove the `/invoices/` part of the href. Everything will still work as before.

```jsx
<Link to="/invoices/abc">Invoice ABC</Link>
// becomes...
<Link to="abc">Invoice ABC</Link>
```

Links are aware of their position in the hierarchy so you can provide a relative path to them. There are a lot of great benefits to using relative links discussed in the [nesting guide](../nesting).
