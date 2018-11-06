# navigate(to, { state={}, replace=false })

If you need to navigate programmatically (like after a form submits), import `navigate`.

```jsx
import { navigate } from "@reach/router"

const Invoices = () => (
  <div>
    <NewInvoiceForm
      onSubmit={async event => {
        const newInvoice = await createInvoice(
          event.target
        )
        navigate(`/invoices/${newInvoice.id}`)
      }}
    />
  </div>
)
```

Or better, yet, use `props.navigate` passed to your route components and then you can navigate to relative paths:

```jsx
const Invoices = ({ navigate }) => (
  <div>
    <NewInvoiceForm
      onSubmit={async event => {
        const newInvoice = await createInvoice(
          event.target
        )
        // can navigate to relative paths
        navigate(newInvoice.id)
      }}
    />
  </div>
)
```

Navigate returns a promise so you can await it. It resolves after React is completely finished rendering the next screen, even with React Suspense.

```jsx
class Invoices extends React.Component {
  state = {
    creatingNewInvoice: false
  }

  render() {
    return (
      <div>
        <LoadingBar
          animate={this.state.creatingNewInvoice}
        />
        <NewInvoiceForm
          onSubmit={async event => {
            this.setState({
              creatingNewInvoice: true
            })
            const newInvoice = await createInvoice(
              event.target
            )
            await navigate(
              `/invoice/${newInvoice.id}`
            )
            this.setState({
              creatingNewInvoice: false
            })
          }}
        />
        <InvoiceList />
      </div>
    )
  }
}
```

## to

The path to navigate to.

```jsx
navigate("/some/where")
```

If using `props.navigate` in a Route Component, this can be a relative path.

```jsx
props.navigate("../")
```

You can pass a number to go to a previously visited route.

```jsx
navigate(-1)
```

## option - state

An object to store on location state. This is useful for state that doesn't need to be in the URL but is associated with a route transition. Think of it like "post" data on a server.

```jsx
const NewTodo = () => (
  <TodoForm
    onSubmit={async todo => {
      let id = await createNewTodo(todo)
      // put some state on the location
      navigate("/todos", { state: { newId: id } })
    }}
  />
)

const Todos = props => (
  <div>
    {todos.map(todo => (
      <div
        style={{
          background:
            // read the location state
            todo.id === props.location.state.newId
              ? "yellow"
              : ""
        }}
      >
        ...
      </div>
    ))}
  </div>
)
```

## option - replace

Normally a call to navigate will push a new entry into the history stack so the user can click the back button to get back to the page. If you pass `replace: true` to `navigate` then the current entry in the history stack will be replaced with the new one.

An example is when the user clicks a "purchase" button but needs to log in first, after they log in, you can replace the login screen with the checkout screen you wanted them to be at. Then when they click the back button they won't see the login page again.

```jsx
navigate("/some/where", { replace: true })
```
