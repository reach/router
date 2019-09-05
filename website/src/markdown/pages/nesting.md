# Nesting and Relative Links

Reach Router has the concept of nesting and relativity in a three places:

1. Nested Routes
2. Relative Links
3. Embedded Routers

## Nested Routes

When you render a router, you can nest routes inside other routes and the path's and the render tree will be nested as well.

```jsx
<Router>
  <Root path="/">
    <Home path="/" />
    <Dashboard path="dashboard">
      <DashboardHome path="/" />
      <Trends path="trends" />
      <Graphs path="graphs" />
    </Dashboard>
    <Team path="team">
      <TeamHome path="/" />
      <Profile path=":userId" />
    </Team>
  </Root>
</Router>
```

With the above route config we'd see the following render trees:

```jsx
// "/"
<Root>
  <Home />
</Root>
```

```jsx
// "/dashboard"
<Root>
  <Dashboard>
    <DashboardHome />
  </Dashboard>
</Root>
```

```jsx
// "/dashboard/trends"
<Root>
  <Dashboard>
    <Trends />
  </Dashboard>
</Root>
```

```jsx
// "/team/123"
<Root>
  <Team>
    <Profile userId="123" />
  </Team>
</Root>
```

## Relative Links

Links can have a relative "to" prop.

For example, in the `Dashboard` component from the previous section, these two links are identical:

```jsx
<Link to="/dashboard/trends" />
<Link to="trends" />
```

And if we were in the trends component we could link back up to the dashboard like this:

```jsx
<Link to="../" />
```

Relative paths in the browser are a little different than on the file system and Reach Router has made an opinionated choice here. For many of us, the command line provides our intuition about relative paths

Imagine we're navigating up a directory.

```sh
$ cd /some/where
$ cd ../
$ pwd
/some
```

It works the same way with Reach Router:

```js
// if you're at /some/where
<Link to="../">Up</Link>
// this links to "/some"
```

If you are familiar with how path resolution works in the browser, you'll know that the trailing slash matters:

```js
// if we are at "/some/where/"
window.pushState("..")

// puts us at "/some/where"
// but a lot of people would expect to be at "/some"!

// now that we're at "/some/where"
window.pushState("..")

// puts us at "/some"
```

The difference from the command line here is that you can't be “at a file” in the command line. So any time you `cd` you're working relative to directories only. On the web you _can_ be “at a file”, so the trailing slash indicates if you're “at a file” or “in a directory”.

Reach Router made a choice to ignore trailing slashes completely, therefore eliminating any difference when navigating up the path. Therefore:

```js
// if we're at "/some/where" or "/some/where/"
<Link to="../">Up</Link>
// this links to "/some" in both cases
```

To sum it up, just imagine every url is a "directory" and you’ll do just fine.

## Embedded Routers

Embedded Routers are any Routers you render deeper inside your app beneath another Router. For example, suppose this is at the top of your app:

```jsx
<Router>
  <Home path="/" />
  <Dashboard path="dashboard/*" />
</Router>
```

Any paths like `/dashboard`, `/dashboard/team`, `/dashboard/projects` will match the `Dashboard` route. The dashboard component itself can render a Router, too.

```jsx
const Dashboard = () => (
  <div>
    <h2>Dashboard</h2>
    <nav>
      <Link to="./">Dashboard Home</Link>
      <Link to="team">Team</Link>
      <Link to="projects">Projects</Link>
    </nav>

    <Router>
      <DashboardHome path="/" />
      <Team path="team" />
      <Projects path="projects" />
    </Router>
  </div>
)
```

All links and route paths are relative to the router above them. This makes code splitting and compartmentalizing your app really easy. You could render the Dashboard as its own independent app, or embed it into your large app without making any changes to it.
