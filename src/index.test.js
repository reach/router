import React from "react";
import ReactDOM from "react-dom";
import Component from "@reactions/component";
import { Router, LocationProvider, createHistory } from "./index";
import renderer from "react-test-renderer";

const HOME_TEXT = "Home";
const Home = () => <div>{HOME_TEXT}</div>;

const DASH_TEXT = "Dashboard";
const Dash = ({ children }) => (
  <div>
    {DASH_TEXT} {children}
  </div>
);

const REPORTS_TEXT = "Reports";
const Reports = ({ children }) => (
  <div>
    {REPORTS_TEXT} {children}
  </div>
);

const ANNUAL_REPORT_TEXT = "Annual";
const AnnualReport = () => <div>{ANNUAL_REPORT_TEXT}</div>;

////////////////////////////////////////////////////////////////////////////////

const createHistorySource = initialPathname => {
  let listeners = [];

  function notify() {
    listeners.foreach(fn => fn());
  }

  return {
    location: {
      pathname: initialPathname
    },
    addEventListener(name, fn) {
      if (name === "popstate") {
        listeners.push(fn);
      }
    },
    removeEventListener(name, fn) {
      if (name === "popstate") {
        listeners = listeners.filter(listener => fn !== listener);
      }
    },
    pushState(_, __, pathname) {
      this.location = { pathname };
      notify();
    },
    replaceState(_, __, pathname) {
      this.location = { pathname };
      notify();
    }
  };
};

const render = ({ pathname = "/", element }) => {
  const testHistory = createHistory(createHistorySource(pathname));
  const div = document.createElement("div");
  ReactDOM.render(
    <LocationProvider history={testHistory}>
      {element}
    </LocationProvider>,
    div
  );
  return Promise.resolve(div);
};

////////////////////////////////////////////////////////////////////////////////
// Okay finally some assertions

it("renders a root path component", async () => {
  const node = await render({
    pathname: "/",
    element: (
      <Router>
        <Home path="/" />
      </Router>
    )
  });
  expect(node.innerHTML).toContain(HOME_TEXT);
});

it("renders a more specific path", async () => {
  const node = await render({
    pathname: "/dashboard",
    element: (
      <Router>
        <Home path="/" />
        <Dash path="dashboard" />
      </Router>
    )
  });
  expect(node.innerHTML).toContain(DASH_TEXT);
  expect(node.innerHTML).not.toContain(HOME_TEXT);
});

it("renders a nested path", async () => {
  const node = await render({
    pathname: "/dash/reports",
    element: (
      <Router>
        <Home path="/" />
        <Dash path="dash">
          <Reports path="reports" />
        </Dash>
      </Router>
    )
  });
  expect(node.innerHTML).toContain(DASH_TEXT);
  expect(node.innerHTML).toContain(REPORTS_TEXT);
  expect(node.innerHTML).not.toContain(HOME_TEXT);
});

it("renders a really nested path", async () => {
  const node = await render({
    pathname: "/dash/reports/annual",
    element: (
      <Router>
        <Home path="/" />
        <Dash path="dash">
          <Reports path="reports">
            <AnnualReport path="annual" />
          </Reports>
        </Dash>
      </Router>
    )
  });
  expect(node.innerHTML).not.toContain(HOME_TEXT);
  expect(node.innerHTML).toContain(DASH_TEXT);
  expect(node.innerHTML).toContain(REPORTS_TEXT);
  expect(node.innerHTML).toContain(ANNUAL_REPORT_TEXT);
});

it("renders a really nested path", async () => {
  const node = await render({
    pathname: "/dash/reports/annual",
    element: (
      <Router>
        <Home path="/" />
        <Dash path="dash">
          <Reports path="reports">
            <AnnualReport path="annual" />
          </Reports>
        </Dash>
      </Router>
    )
  });

  expect(node.innerHTML).not.toContain(HOME_TEXT);
  expect(node.innerHTML).toContain(DASH_TEXT);
  expect(node.innerHTML).toContain(REPORTS_TEXT);
  expect(node.innerHTML).toContain(ANNUAL_REPORT_TEXT);
});

it("parses params as component props", async () => {
  const USER_ID = "ryan";
  const User = ({ id }) => <div>{id}</div>;

  const node = await render({
    pathname: `/users/${USER_ID}`,
    element: (
      <Router>
        <User path="users/:id" />
      </Router>
    )
  });

  expect(node.innerHTML).toContain(USER_ID);
});

it("parses multiple params as component props", async () => {
  const USER_ID = "ryan";
  const GROUP_ID = "party-pooper";
  const User = ({ userId, groupId }) => (
    <div>
      {userId} {groupId}
    </div>
  );

  const node = await render({
    pathname: `/${GROUP_ID}/user/${USER_ID}`,
    element: (
      <Router>
        <User path=":groupId/user/:userId" />
      </Router>
    )
  });

  expect(node.innerHTML).toContain(USER_ID);
  expect(node.innerHTML).toContain(GROUP_ID);
});

it("parses multiple params when nested", async () => {
  const USER_ID = "ryan";
  const GROUP_ID = "party-pooper";
  const Group = ({ groupId, children }) => (
    <div>
      {groupId} {children}
    </div>
  );
  const User = ({ userId }) => <div> {userId} </div>;

  const node = await render({
    pathname: `/group/${GROUP_ID}/user/${USER_ID}`,
    element: (
      <Router>
        <Group path="group/:groupId">
          <User path="user/:userId" />
        </Group>
      </Router>
    )
  });

  expect(node.innerHTML).toContain(USER_ID);
  expect(node.innerHTML).toContain(GROUP_ID);
});

const snapshot = ({ pathname, element }) => {
  const testHistory = createHistory(createHistorySource(pathname));
  const tree = renderer
    .create(
      <LocationProvider history={testHistory}>
        {element}
      </LocationProvider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
};

it.only("what does it do with the same param?", async () => {
  const GROUP_ID = "burger";
  const GROUP_ID_2 = "milkshake";

  const Group = ({ groupId, children }) => (
    <div>
      {groupId} {children}
    </div>
  );

  snapshot({
    pathname: `/groups/${GROUP_ID}/groups/${GROUP_ID_2}`,
    element: <div>Hello</div>
  });
});
