# Router

Matches children [Route Components](RouteComponent) to the location and renders the matching child.

## children: elements

Router will match the location to the path of each of the children. The best match will be rendered.

Route Components can be nested and their paths will inherit their parent's path.

Route Components must have a `path` prop, a `default` prop, or be a `Redirect`. When no other child matches, the child with a `default` prop will be rendered.

Please see [Route Components](RouteComponent) for the props Router passes and how URL parameters work.

```jsx
<Router>
  <App path="/">
    <Dashboard path="/" />
    <Event path="event/:eventId" />
    <Calender path="calendar">
      <Redirect from="/" to="weekly" />
      <Monthly path="monthly" />
      <Weekly path="weekly" />
      <Daily path="daily" />
    </Calender>
  </App>
  <NotFound default />
</Router>
```

## basepath: string

The path to base all relative paths down the tree too. Used internally but also helpful for rendering a root router in the sub directory of a larger app.

```jsx
<Router basepath="/admin" />
```

## primary: bool

Defaults to true. Primary Routers will manage focus on location transitions. If false, focus will not be managed. This is useful for Routers rendered as asides, headers, breadcrumbs etc. but not the main content.

```jsx
const App = () => (
  <div>
    <Sidebar>
      {/* we don't want this taking focus */}
      <Router primary={false}>
        <HomeNav path="/" />
        <OrdersNav path="/orders" />
        <SettingsNav path="/settings" />
      </Router>
    </Sidebar>

    <main>
      {/* but we do want this to manage focus */}
      <Router>
        <Home path="/" />
        <Orders path="/orders" />
        <Settings path="/settings" />
      </Router>
    </main>
  </div>
)
```

## location: location

The location to match Route Components against. You don't typically need to pass this in as it is received from context by default. Passing in a location mostly useful for animations where you pass in the old location so the transitioning-out components continue to match the old location.

```jsx
import { Location, Router } from "@reach/router"
import {
  TransitionGroup,
  CSSTransition
} from "react-transition-group"

const App = () => (
  <Location>
    {({ location }) => (
      <TransitionGroup>
        <CSSTransition key={location.key}>
          {/* pass in the location so transitions work */}
          <Router location={location}>
            <HSL path="/" h="10" s="90" l="50" />
            <HSL path="/:h/:s/:l" />
            <RGB path="/:r/:g/:b" />
          </Router>
        </CSSTransition>
      </TransitionGroup>
    )}
  </Location>
)
```
