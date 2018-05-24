# Tutorial - Navigating Imperatively

Sometimes you need to navigate in response to something other than the user clicking on a link. For this we have `navigate`. Let's import `navigate`.

```jsx
import {
  Router,
  Link,
  navigate
} from "@reach/router"
```

Probably the most common reason to use `navigate` is a form submission. Perhaps the user submits a form, you save some data, and then navigate to the record. Let's add this form to `Invoices`:

```jsx
const Invoices = props => (
  <div>
    {/* ... */}

    <form
      onSubmit={event => {
        event.preventDefault()
        const id = event.target.elements[0].value
        event.target.reset()

        // pretend like we saved a record to the DB here
        // and then we navigate imperatively
        navigate(`/invoices/${id}`)
      }}
    >
      <p>
        <label>
          New Invoice ID: <input type="text" />
        </label>
        <button type="submit">create</button>
      </p>
    </form>

    {props.children}
  </div>
)
```

Go ahead and submit the form and watch the router navigate to the new invoice.

Oh, one more thing. Route Components get a `navigate` prop. This version of the function is aware of its position in the hierarchy. This means you can navigate to relative paths the same way you can link to them.

Go ahead and remove the spot where we imported navigate and let's use the prop instead:

```jsx
navigate(`/invoices/${id}`)
// becomes
props.navigate(id)
```
