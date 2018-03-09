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

const Group = ({ groupId, children }) => (
  <div>
    {groupId} {children}
  </div>
);

////////////////////////////////////////////////////////////////////////////////

const createHistorySource = initialPathname => {
  let listeners = [];
  let location = { pathname: initialPathname };

  function notify() {
    listeners.forEach(fn => fn());
  }

  return {
    testHistory: true,

    get location() {
      return location;
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
    history: {
      pushState(_, __, pathname) {
        location = { pathname };
      },
      replaceState(_, __, pathname) {
        location = { pathname };
      }
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

const snapshot = ({ pathname, element }) => {
  const testHistory = createHistory(createHistorySource(pathname));
  const result = renderer.create(
    <LocationProvider history={testHistory}>{element}</LocationProvider>
  );
  const tree = result.toJSON();
  expect(tree).toMatchSnapshot();
};

function runWithNavigation(element, pathname = "/") {
  const testHistory = createHistory(createHistorySource(pathname));
  const div = document.createElement("div");
  document.body.appendChild(div);
  ReactDOM.render(
    <LocationProvider history={testHistory}>
      {element}
    </LocationProvider>,
    div
  );

  const snapshot = string => {
    expect(div.innerHTML).toBe(string);
  };
  return { navigate: testHistory.navigate, snapshot };
}

////////////////////////////////////////////////////////////////////////////////
// Okay finally some assertions

it("renders a root path component", () => {
  snapshot({
    pathname: "/",
    element: (
      <Router>
        <Home path="/" />
      </Router>
    )
  });
});

it("renders a more specific path", () => {
  snapshot({
    pathname: "/dashboard",
    element: (
      <Router>
        <Home path="/" />
        <Dash path="dashboard" />
      </Router>
    )
  });
});

it("renders a nested path", () => {
  snapshot({
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
});

it("renders a really nested path", () => {
  snapshot({
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
});

it("parses params as component props", () => {
  const USER_ID = "ryan";
  const User = ({ id }) => <div>{id}</div>;

  snapshot({
    pathname: `/users/${USER_ID}`,
    element: (
      <Router>
        <User path="users/:id" />
      </Router>
    )
  });
});

it("parses multiple params as component props", () => {
  const USER_ID = "ryan";
  const GROUP_ID = "party-pooper";
  const User = ({ userId, groupId }) => (
    <div>
      {userId} {groupId}
    </div>
  );

  snapshot({
    pathname: `/${GROUP_ID}/user/${USER_ID}`,
    element: (
      <Router>
        <User path=":groupId/user/:userId" />
      </Router>
    )
  });
});

it("parses multiple params when nested", () => {
  const USER_ID = "ryan";
  const GROUP_ID = "party-pooper";
  const User = ({ userId }) => <div>{userId}</div>;

  snapshot({
    pathname: `/group/${GROUP_ID}/user/${USER_ID}`,
    element: (
      <Router>
        <Group path="group/:groupId">
          <User path="user/:userId" />
        </Group>
      </Router>
    )
  });
});

it("shadows params in nested paths", () => {
  snapshot({
    pathname: `/groups/burger/groups/milkshake`,
    element: (
      <Router>
        <Group path="groups/:groupId">
          <Group path="groups/:groupId" />
        </Group>
      </Router>
    )
  });
});

it("selects a static path over a dynamic segment", () => {
  snapshot({
    pathname: `/home`,
    element: (
      <Router>
        <Group path=":groupId" />
        <Home path="home" />
      </Router>
    )
  });
});

it("selects a static path over a dynamic segment", () => {
  snapshot({
    pathname: `/home`,
    element: (
      <Router>
        <Group path=":groupId" />
        <Home path="home" />
      </Router>
    )
  });
});

it("allows arbitrary Router nesting", () => {
  const Chat = ({ url }) => (
    <div>
      Home
      <ChatApp basepath={url} />
    </div>
  );

  const ChatApp = ({ basepath }) => (
    <Router basepath={basepath}>
      <ChatHome path="/" />
    </Router>
  );

  const ChatHome = ({ url }) => <div>Chat Home</div>;

  snapshot({
    pathname: `/chat`,
    element: (
      <Router>
        <Chat path="/chat" />
      </Router>
    )
  });
});

it("matches on specificity", () => {
  const Groups = ({ children }) => <div>Groups {children}</div>;
  const Group = ({ groupId, children }) => (
    <div>
      Group: {groupId} {children}
    </div>
  );
  const Users = ({ children }) => <div>Users {children}</div>;
  const User = ({ userId, children }) => (
    <div>
      User: {userId} {children}
    </div>
  );

  const Winner = () => <div>Yes I am</div>;

  const element = (
    <Router>
      <Home path="/" />
      <Groups path="groups">
        <Group path=":groupId">
          <Users path="users">
            <User path=":userId" />
          </Users>
        </Group>
      </Groups>
      <Groups path="groups">
        <Group path="mine">
          <Users path="users">
            <User path="me" />
          </Users>
        </Group>
      </Groups>
      <Winner path="groups/gonna/users/win" />
    </Router>
  );

  snapshot({ element, pathname: "/" });

  snapshot({ element, pathname: "/groups" });
  snapshot({ element, pathname: "/groups/123" });
  snapshot({ element, pathname: "/groups/123/users" });
  snapshot({ element, pathname: "/groups/123/users/abc" });
  snapshot({ element, pathname: "/groups/mine/users/me" });

  snapshot({ element, pathname: "/groups/mine" });
  snapshot({ element, pathname: "/groups/mine/users" });
  snapshot({ element, pathname: "/groups/mine/users/me" });

  snapshot({ element, pathname: "/groups/gonna/users/win" });
});

it.only("transitions pages", async () => {
  const { snapshot, navigate } = runWithNavigation(
    <Router>
      <Home path="/" />
      <Reports path="reports" />
    </Router>
  );
  snapshot("<div>Home</div>");
  await navigate("/reports");
  snapshot("<div>Reports </div>");
});
