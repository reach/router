# Large Scale Apps

The trick to building large apps is to not to! Instead, build large apps by composing small apps together. A motivating philosophy behind Reach Router is to allow you to do this.

There are couple of benefits to this approach to UI development:

* Teams can work on their features in isolation and then compose their screens into a larger app with little effort.

* Build tools like webpack can code-split features into their own bundles so users don't have to download the whole application on first load. Adding new routes to a photo viewer or reports screen doesn't have to change anything about the initial bundle size.

Reach Router helps accomplish this with two features:

1. Embedded Routers
2. Relative Links

You can read more about both in the [Nesting Guide](nesting).

## Top Level Code Splitting

Here's some sample code that, when coupled with webpack and React Loadable, would generate separate bundles for the `Dashboard` and `Reports` screens, only loading them on demand.

```jsx
import React from "react"
import Loadable from "react-loadable"
import Loading from "./Loading"

const AsyncDashboard = Loadable({
  loader: () => import("./Dashboard"),
  loading: Loading
})

const AsyncReports = Loadable({
  loader: () => import("./Reports"),
  loading: Loading
})

ReactDOM.render(
  <Router>
    <Home path="/" />
    <AsyncDashboard path="dashboard/*" />
    <AsyncReports path="reports/*" />
  </Router>,
  root
)
```

This is excellent because the only application code the user downloads is the `Home` screen. The rest comes as they navigate.

## Embedded Apps

One team might be in charge of this top level orchestration of all the features coming together under this one router, and another team works exclusively on the Reports screen.

The reports feature likely has multiple routes, but the team that brings all the bundles together doesn't need to know or care. The Reports team can render their own router with the routes they need--without effecting the initial bundle!

```jsx
const Reports = () => (
  <div>
    <ul>
      <li>
        <Link to="./">Reports Home</Link>
      </li>
      <li>
        <Link to="users">Users Report</Link>
      </li>
      <li>
        <Link to="usage">Usage Report</Link>
      </li>
      <li>
        <Link to="sales">Sales Report</Link>
      </li>
    </ul>

    <Router>
      <ReportsHome path="/" />
      <Users path="users" />
      <Usage path="usage" />
      <Sales path="sales" />
    </Router>
  </div>
)
```

All of the paths and links here will be relative to the parent router. The href for the "Users Report" link will be "/reports/users", and the path for the `<Users path="users" />` component will actually be `/reports/users`.

## Rendering in Isolation

During testing or development, the reports team can render their entire portion of the app in isolation by simply rendering their top-level component:

```jsx
ReactDOM.render(<Reports />, root)
```

Because all the routes and links are relative, the app works either way.

## Reusable Apps

These features apply to apps you may want to embed in multiple places, or across applications at your organization. A chat window is a perfect example.

```jsx
const Chat = props => (
  <div>
    <ChatHeader user={props.user} />
    <Router>
      <ChatList path="/" users={props.friends} />
      <Chat path=":friendId" />
    </Router>
  </div>
)
```

This component (and router) can be embedded anywhere. Pass it a user and their friends and then all the routes and links will be relative to the app that rendered it. Let's imagine it's one of those little chat windows in the bottom right side of the window that we can render on any of our other screens.

```jsx
const SomeTopLevelApp = () => (
  <Router>
    <Course path="course/:courseId" />
    <Group path="group/:groupId" />
  </Router>
)

const Course = props => (
  <CourseData id={props.courseId}>
    {course => (
      <div>
        <h1>Course {course.name}</h1>

        {/* chat with members of the course */}
        <Chat
          user={currentUser}
          friends={course.students}
        />
      </div>
    )}
  </CourseData>
)

const Group = props => (
  <GroupData id={props.courseId}>
    {group => (
      <div>
        <h1>Group {group.name}</h1>

        {/* chat with members of the group */}
        <Chat
          user={currentUser}
          friends={group.members}
        />
      </div>
    )}
  </GroupData>
)
```

At `/courses/123/chat` we'll get the window with a list of all the people to chat with, and at `/courses/123/ryan`, you'll be chatting with Ryan. Likewise, at `/groups/abc` you'll get a chat window with the members of your group and at `/groups/abc/marcy` you'll be chatting with Marcy.

Don't build big apps. Build small ones and put them together.
