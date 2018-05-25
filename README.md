<p align="center">
  <a href="https://reach.tech/router/">
    <img alt="Reach Router" src="./logo-horizontal.png" width="400">
  </a>
</p>

<p align="center">
  Next Generation Routing for <a href="https://facebook.github.io/react">React</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@reach/router"><img src="https://img.shields.io/npm/v/@reach/router.svg?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@reach/router"><img src="https://img.shields.io/npm/dm/@reach/router.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/reach/router"><img src="https://img.shields.io/travis/reach/router/master.svg?style=flat-square"></a>
</p>

## Installation

```bash
yarn add @reach/router
```

And then import it:

```js
import { Router, Link, Redirect } from "@reach/router";
```

Or use script tags and globals.

```html
<script src="https://unpkg.com/@reach/router"></script>
<script>
ReactionsRouter.Router;
ReactionsRouter.Link;
ReactionsRouter.Redirect;
</script>
```

## Why?

* I needed a router to play with React Suspsense, this showed up in my editor and I loved it.
* It appears from npm stats that about 1/2 of React Router downloads haven't upgraded to v4. Why? I think two things:
  * Backwards compatibility. This router brings a commitement to backwards compatibility and smooth upgrade paths like React itself, starting with pretty good backwards compatibility with React Router v3. It's here to help you keep up with the great new stuff React is offering.
  * Nested route configuration was awesome. This brings that back without losing any of what made React Router v4 innovative (actually rendering components).
* Also, don't you think it's about time we had relative links?

## How To

### Rendering

Routers select a child to render based on the child's path. The children are just other components that could be rendered on their own outside of a Router.

```js
import { React } from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";

let Home = () => <div>Home</div>;
let Dash = () => <div>Dash</div>;

render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard" />
  </Router>
);
```

### Navigate With Link

To navigate around the app, render a `Link` somewhere.

```jsx
let Home = () => (
  <div>
    <h1>Home</h1>
    <nav>
      <Link to="/">Home</Link> | <Link to="dashboard">Dashboard</Link>
    </nav>
  </div>
);

let Dash = () => <div>Dash</div>;

render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard" />
  </Router>
);
```

### Parse Data From the URL

If you need to parse the data out of the URL, use a dynamic segment--they start with a `:`. The parsed value will become a prop sent to the matched component.

```jsx
// at url "/invoice/23"

render(
  <Router>
    <Home path="/" />
    <Invoice path="invoice/:invoiceId" />
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

### Ambiguous Paths and Ranking

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

### Nested Component Paths

You can nest components inside of a Router, and the paths will nest too. The matched child component will come in as the `children` prop, the same as if you'd rendered it directly. (Internally `Router` just renders another `Router`, but I digress...)

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

Most apps probably have some sort of global chrome/navigation, that works out just fine:

```jsx
const Main = ({ children }) => (
  <div>
    <h1>Welcome to the App!</h1>
    <ul>
      <li>
        <Link to="dashboard">Dashboard</Link>
      </li>
      <li>
        <Link to="invoices">Invoices</Link>
      </li>
    </ul>
    <hr />
    {children}
  </div>
);

render(
  <Router>
    <Main path="/">
      <Invoices path="invoices" />
      <Dash path="dashboard" />
    </Main>
  </Router>
);
```

### Relative Links

You can link to relative paths. The relativity comes from the path of the component that rendered the Link. These two links will link to "/dashboard/invoices" and "/dashboard/team" because they're rendered inside of `<Dash/>`. This is really nice when you change a parent's URL, or move the components around.

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

This also makes it trivial to render any section of your app as its own application with its own router. If all your links are relative, it can be embedded inside any other router and just work.

### "Index" Paths

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

### Not Found "Default" Components

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

You can render a router anywhere you want in your app, even deep inside another Router, just makes sure to use a splat (`*`) on the parent component so nested paths match it.

```jsx
render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard/*" />
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

This allows you to have all of your routes configured at the top of the app, or to configure only where you need them, which is really helpful for code-splitting and very large apps. You can even render `Dash` as an independent application.

### Navigating Programmatically

If you need to navigate programmatically (like after a form submits), import `navigate`.

```jsx
import { navigate } from "@reach/router";

const Invoices = () => (
  <div>
    <NewInvoiceForm
      onSubmit={async event => {
        const newInvoice = await createInvoice(event.target);
        navigate(`/invoices/${newInvoice.id}`);
      }}
    />
  </div>
);
```

Or better, yet, use `props.navigate` passed to your route components and then you can navigate to relative paths:

```jsx
const Invoices = ({ navigate }) => (
  <div>
    <NewInvoiceForm
      onSubmit={async event => {
        const newInvoice = await createInvoice(event.target);
        // can navigate to relative paths
        navigate(newInvoice.id);
      }}
    />
  </div>
);
<Router>
  <Invoices path="invoices" />
  <Invoice path="invoices/:id" />
</Router>;
```

Navigate returns a promise so you can await it. It resolves after React is completely finished rendering the next screen, even with React Suspense.

```jsx
class Invoices extends React.Component {
  state = {
    creatingNewInvoice: false
  };

  render() {
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

## React Suspense Ready (as it can be, ofc)

### History Stack Handling

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

### Low Priority Updates

Router's state changes are marked as "low priority". It's very common to hook a user input up to a query string in the URL. Every time the user types, the url updates, and then React rerenders. Router state is given low priority so these inputs will not bind the CPU like they would have otherwise.

## API

```jsx
import { Router, Link, Redirect, MatchPath, navigate } from "@reach/router";
```

```jsx
<Router>
  <AnyComponent path={string} />
  <AnyComponent path={string}>
    <AnyComponent path={relativeString} />
  </AnyComponent>
  <AnyComponent default />
  <Redirect from={string} to={string} />
</Router>
```

```jsx
<Link to={str} replace={bool} state={obj} {...anchorProps} />
```

```jsx
navigate(to);
navigate(to, { replace, state });

await navigate(...)
navigate.then(...)
```

```jsx
<MatchPath path={string}>
  {({ match, location, navigate }) => (...)}
</MatchPath>
```

## React Router v4 Compatibility

* Remove `<BrowserRouter>`, don't need it.
* Swap out `<Switch>` for `<Router>`
  * Swap out `<Route>` inside a `<Switch>` for just your component:
    * this: `<Route path="/users" component={Users} />`
    * becomes `<Users path="/users" />`
  * remove exact props, it'll know what you meant
* Swap out `<Route>` outside of `<Switch>` for `<MatchPath>`
  * Remove `exact` props
    * exact match `<MatchPath path="/foo" />`
    * partial match `<MatchPath path="/foo/*" />`

## React Router v3 Backward Compatibility

Because Reactions Router brings back nested route configuration, it was plausible to add in a lot of backward compatibility for React Router v3 (😍). While not everything is supported, some React Router v3 apps will be able to drop in Reactions Router without any code changes (almost all of the RR v3 demos worked w/o modification). Other apps will need to make a few tweaks and you're on your way.

First, install Reactions Router

```
yarn add @reach/router
```

Then do a find/replace across your app:

```
// from
import { Router, Link, Route } from 'react-router'

// to
import { Router, Link, Route } from '@reach/router/compat'
```

Next, cross your fingers and hope everything still works.

FYI, I'd love to help out with this for a few people, DM me on twitter and we'll do some pairing.

### Unsupported RRv3 API

Here's what's not supported (and probably never will be), check if your app is using these APIs:

* Custom histories - whatever you were doing there, you can do in a top-level component somewhere.
* `hashHistory` - Sorry, won't be supporting these.
* `browserHistory` is partially supported, here are the supported methods
  * `listen` - supported
  * `push` - supported
  * `replace` - supported
* `<Router>` is supported but these props are not:
  * `<Router createElement>` - Move to actual route component render method.
  * `<Router onError>` - use `componentDidCatch` in a component above your `Router`.
  * `<Router onUpdate/>` - Make a component that checks if `prevProps.location !== this.props.location` in `componentDidUpdate`.
  * `<Router render/>` - Move to actual route component render method
* `<Route>` is supported, but these props are not:
  * `<Route getIndexRoute>` - Use `getChildRoutes` and give the index route a `/` path.
  * `<Route components>` - Render two Routers in the parent that rendered the different "components".
  * `<Route getComponents>` - Render two Routers in the parent that rendered the different "components".
* `<IndexRedirect>` - Use `<Redirect from="/" to="/some/where"/>` because "/" is the same as an `IndexRoute`
* Route Component props
  * `route` - can use your component props
  * `routes` - matching works too differently to support this
  * `routeParams` - you still have normal params
* `match` Not sure what to do here, only a problem for server rendered apps ... only suggestion is stop server rendering and rely on service workers? When React Suspense ships we won't need this for server rendering anymore anyway.
* `<RouterContext>` - probably only used for server rendering
* `createRoutes`
* `PropTypes`
* Any React Router Redux integrations. I'd recommend not reading from redux and just reading from your route component props, this uses the new context API so you'll get updates w/o needing to synchronize routing state to redux. You can also use the `navigate` singleton export to navigate in action creators. Delete all that stuff!

### Migrating Slowly

Once your app is running on Reactions Router, you'll have a console-full of warnings to help guide the migratin. You can start to migrate one route at a time to the official API.

```jsx
// pick a route and switch it to the official API,
// let's do the index route first
<Router>
  <Route path="/" component={App}>
    <IndexRoute component={Index}/>
    <Route path="users/:userId" component={User}/>
  </Route>
</Router>

// becomes
<Router>
  <Route path="/" component={App}>
    <Index path="/"/>
    <Route path="users/:userId" component={User}/>
  </Route>
</Router>

// Then change the Users component to read from `this.props.userId`
// instead of `this.props.params.userId`

const User = ({ params }) => <div>{params.userId}</div>

const User = ({ userId }) => <div>{userId}</div>

// now go update the route config:
<Router>
  <Route path="/" component={App}>
    <Index path="/"/>
    <User path="users/:userId"/>
  </Route>
</Router>

// And finally update the App route
<Router>
  <App path="/">
    <Index path="/"/>
    <User path="users/:userId"/>
  </App>
</Router>

// When all of your routes run without warnings, you can update the import

import ... from '@reach/router/compat'
// becomes
import ... from '@reach/router'
```

Congratulations, you're not gonna get left behind anymore!

## Legal

MIT License
Copyright (c) 2018-present, Ryan Florence
