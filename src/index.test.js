import React from "react";
import ReactDOM from "react-dom";
import { Router, LocationProvider, createHistory, Link } from "./index";
import renderer from "react-test-renderer";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

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
  let index = 0;
  let stack = [{ pathname: initialPathname }];
  let states = [];

  return {
    get location() {
      return stack[index];
    },
    addEventListener(name, fn) {},
    removeEventListener(name, fn) {},
    history: {
      get entries() {
        return stack;
      },
      get index() {
        return index;
      },
      get state() {
        return states[index];
      },
      pushState(state, _, pathname) {
        index++;
        stack.push({ pathname });
        states.push(state);
      },
      replaceState(state, _, pathname) {
        stack[index] = { pathname };
        states[index] = state;
      }
    }
  };
};

const snapshot = ({ pathname, element }) => {
  const testHistory = createHistory(createHistorySource(pathname));
  const wrapper = renderer.create(
    <LocationProvider history={testHistory}>{element}</LocationProvider>
  );
  const tree = wrapper.toJSON();
  expect(tree).toMatchSnapshot();
};

function runWithNavigation(element, pathname = "/") {
  const history = createHistory(createHistorySource(pathname));
  const wrapper = renderer.create(
    <LocationProvider history={history}>{element}</LocationProvider>
  );

  const snapshot = string => {
    expect(wrapper.toJSON()).toMatchSnapshot();
  };

  return { history, snapshot, wrapper };
}

function runInDOM(element, pathname) {
  const history = createHistory(createHistorySource(pathname));
  const wrapper = mount(
    <LocationProvider history={history}>{element}</LocationProvider>
  );
  return { wrapper, history };
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

it("transitions pages", async () => {
  const { snapshot, history: { navigate } } = runWithNavigation(
    <Router>
      <Home path="/" />
      <Reports path="reports" />
    </Router>
  );
  snapshot();
  await navigate("/reports");
  snapshot();
});

it("keeps the stack right on interrupted transitions", async () => {
  const {
    snapshot,
    history,
    history: { navigate }
  } = runWithNavigation(
    <Router>
      <Home path="/" />
      <Reports path="reports" />
      <AnnualReport path="annual-report" />
    </Router>
  );
  navigate("/reports");
  await navigate("/annual-report");
  snapshot();
  expect(history.index === 1);
});

it.skip("supports relative links", async () => {
  // something is up with jsdom (maybe), relative links work in the browser,
  // but the href doesn't resolve correctly in here, will look into later
  const Reports = () => (
    <div>
      <Link to="annual-report">Annual Report</Link>
    </div>
  );

  const { wrapper, history } = runInDOM(
    <Router>
      <Home path="/" />
      <Reports path="reports">
        <AnnualReport path="annual-report" />
      </Reports>
    </Router>,
    "/reports"
  );
  expect(wrapper.html()).toEqual(
    '<div><a href="annual-report">Annual Report</a></div>'
  );
  await new Promise(res => {
    history.listen(res);
    wrapper.find("a").simulate("click", { button: 0 });
  });
  expect(wrapper.html()).toEqual(
    '<div><a href="annual-report">Annual Report</a></div>'
  );
});
