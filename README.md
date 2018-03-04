# @reactions/router

## Installation

```bash
npm install @reactions/router
# or
yarn add @reactions/router
```

And then import it:

```js
// using es modules
import { Router, Link } from "@reactions/router";

// common.js
const { Router, Link } = require("@reactions/router");

// AMD
// I've forgotten but it should work.
```

Or use script tags and globals.

```html
<script src="https://unpkg.com/@reactions/router"></script>
```

And then grab it off the global like so:

```js
ReactionsRouter.Router;
ReactionsRouter.Link;
```

## Take 5 minutes and read this first

### Rendering

Routers select a child to render based on the child's path. The children are just other components that could be rendered on their own.

```js
import { React } from "react";
import { render } from "react-dom";
import { Router, Link } from "@reactions/router";

const Home = () => <div>Home</div>;
const Dash = () => <div>Dash</div>;

render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard" />
  </Router>
);
```

### Navigate with Link

To navigate around the app, render a `Link` somewhere.

```jsx
render(
  <div>
    <nav>
      <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link>
    </nav>
    <Router>
      <Home path="/" />
      <Dash path="dashboard" />
    </Router>
  </div>
);
```

### Parse data from the URL

If you need to parse the data out of the URL, use a dynamic segment--they start with a `:`. The parsed value will become a prop sent to the matched component.

```jsx
// at url "/23"

render(
  <Router>
    <Home path="/" />
    <Invoice path=":invoiceId" />
  </Router>
);

const Invoice = props => (
  <div>
    <h1>Invoice {props.invoiceId}</h1>
  </div>
);
```

It's the same as rendering the component directly.

```jsx
<Invoice invoiceId={23} />
```

### Ambiguous paths and ranking

Even though two paths might be ambiguous--like "/:invoiceId" and "/invoices"--Router ranks the paths and renders the one that makes the most sense.

```jsx
render(
  <Router>
    <Home path="/" />
    <Invoice path=":invoiceId" />
    <InvoiceList path="invoices" />
  </Router>
);
```

The URL "/invoices" will render `<Invoices/>` and "/123" will render `<Invoice invoiceId={123}/>`. Same thing with the `Home` component. Even though it’s defined first, and every path will match "/", `Home` won't render unless the path is exactly "/". So don't worry about the order of your paths.

### Nested Router children and paths

You can nest components inside of a Router, and the paths will nest too. The matched child component will come in as the `children` prop, the same as if you'd rendered it directly. (Internally `Router` just renders another `Router` with a `basepath`, but I digress...)

```jsx
const Dash = ({ children }) => (
  <div>
    <h1>Dashboard</h1>
    <hr />
    {children}
  </div>
);

render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard">
      <Invoices path="invoices" />
      <Team path="team" />
    </Dash>
  </Router>
);
```

If the URL is "/dashboard/invoices" then the Router will render `<Dash><Invoices/></Dash>`. If it's just "/dashboard", `children` will be `null` and we’ll only see `<Dash/>`.

### Relative Links

You can link to relative paths. The relativity comes from the path of the component that rendered the Link. These two links will link to "/dashboard/invoices" and "/dashboard/team" because they're rendered inside of `<Dash/>`. This is really nice when you change a parent's URL, or move the components around, there’s no need to change the links.

```jsx
render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard">
      <Invoices path="invoices" />
      <Team path="team" />
    </Dash>
  </Router>
);

const Dash = ({ children }) => (
  <div>
    <h1>Dashboard</h1>
    <nav>
      <Link to="invoices">Invoices</Link> <Link to="team">Team</Link>
    </nav>
    <hr />
    {children}
  </div>
);
```

This also makes it trivial to render any section of your app as its own application.

### "Index" paths

Nested components can use the path `/` to signify they should render
at the path of the parent component, like an index.html file inside
a folder on a static server. If this app was at "/dashboard" we'd see this
component tree: `<Dash><DashboardGraphs/></Dash>`

```jsx
render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard">
      <DashboardGraphs path="/" />
      <InvoiceList path="invoices" />
    </Dash>
  </Router>
);
```

### Not found "default" components

Put a default prop on a component and Router will render it when nothing else matches.

```jsx
const NotFound = () => <div>Sorry, nothing here.</div>;

render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard">
      <DashboardGraphs path="/" />
      <InvoiceList path="invoices" />
    </Dash>
    <NotFound default />
  </Router>
);
```

### Multiple Routers

If you want to match the same path in two places in your app, just render two
Routers. Again, a Router picks a single child to render based on the URL, and
then ignores the rest.

```jsx
render(
  <div>
    <Sidebar>
      <Router>
        <HomeNav path="/" />
        <DashboardNav path="dashboard" />
      </Router>
    </Sidebar>

    <MainScreen>
      <Router>
        <Home path="/">
          <About path="about" />
          <Support path="support" />
        </Home>
        <Dash path="dashboard">
          <Invoices path="invoices" />
          <Team path="team" />
        </Dash>
      </Router>
    </MainScreen>
  </div>
);
```

### Nested Routers

You can render a router anywhere you want in your app, even deep inside another Router. All the matching and linking will be relative to all the parents.

```jsx
render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard" />
  </Router>
);

const Dash = () => (
  <div>
    <p>A nested router</p>
    <Router>
      <DashboardGraphs path="/" />
      <InvoiceList path="invoices" />
    </Router>
  </div>
);
```

This allows you to have all of your routes configured at the top of the app, or to configure only where you need them, which is really helpful for code-splitting and very large apps.

### Navigating programmatically

If you need to navigate programmatically (like after a form submits)
use the `navigate` prop that comes to your component

```jsx
const Invoices = ({ navigate }) => (
  <div>
    <NewInvoiceForm
      onSubmit={async event => {
        const newInvoice = await createInvoice(event.target);
        navigate(`/invoice/${newInvoice.id}`);
      }}
    />
  </div>
);
```

Or get it from context if you're deep in the render tree.

```jsx
const NotARouterChildComponent = () => (
  <div>
    <p>Somewhere deep</p>
    <Location>
      {({ navigate }) => (
        <NewInvoiceForm
          onSubmit={async event => {
            const newInvoice = await createInvoice(event.target);
            navigate(`/invoice/${newInvoice.id}`);
          }}
        />
      )}
    </Location>
  </div>
);
```

Navigate returns a promise so you can await it. It resolves after React is completely finished rendering the next screen.

```jsx
class Invoices extends React.Component {
  state = {
    creatingNewInvoice: false
  };

  render() {
    const { navigate } = this.props;
    return (
      <div>
        <LoadingBar animate={this.state.creatingNewInvoice} />
        <NewInvoiceForm
          onSubmit={async event => {
            this.setState({ creatingNewInvoice: true });
            const newInvoice = await createInvoice(event.target);
            await navigate(`/invoice/${newInvoice.id}`);
            this.setState({ creatingNewInvoice: false });
          }}
        />
        <InvoiceList />
      </div>
    );
  }
}
```

## React Suspense and Time Slicing Ready

### History stack handling

With React Suspense a user may click on a link, and while data is loading they may change their mind and click on a different link. The browser navigation history will contain all three entries:

```
/first-page -> /cancelled-page -> /desired-page
```

If they click the back button from `/desired-page`, they'll get an unexpected `/cancelled-paged` screen. They didn't see it on their way to `/desired-page` so it doesn’t make sense for it to be there on the way back to `/first-page`.

Reactions Router will not add the cancelled page to the history stack, so it would look like this:

```
/first-page -> /desired-page
```

Now when the user clicks back, they don’t end up on a page they never even saw. This is how browsers work with plain HTML pages, too.

### Low priority updates

Router takes advantage of "Time Slicing" in React . It's very common to hook a user input up to a query string in the URL. Every time the user types, the url updates, and then React rerenders. Router state is given "low priority" so these inputs will not bind the CPU like they would have otherwise.

## Legal

MIT License
Copyright (c) 2018-present, Ryan Florence
