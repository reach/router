# Tutorial - URL Parameters

Let's create another screen called `Invoice`. It expects a prop called `invoiceId`. You can imagine it being rendered like `<Invoice invoiceId="abc"/>`.

```jsx
const Invoice = props => (
  <div>
    <h2>Invoice {props.invoiceId}</h2>
  </div>
)
```

Next add it to the `<Router>`. Note the path. That `:invoiceId` is called a "URL Parameter". You'll see what it does next.

```jsx
<Router>
  <Invoice path="invoices/:invoiceId" />
  {/*...*/}
</Router>
```

Finally, link to the new route somewhere.

```jsx
<Link to="invoices/123">Invoice 123</Link>
<Link to="invoices/abc">Invoice ABC</Link>
```

The name of the url parameter (`:invoiceId`) becomes a prop by the same name on your route component (`props.invoiceId`). It gets parsed from the URL and passed to you.

Besides using it to render, it's common to use that prop in `componentDidMount` to fetch some data.
