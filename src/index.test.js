/* eslint-disable react/prop-types */
import React from "react";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";
import { renderToString } from "react-dom/server";

import {
  createHistory,
  createMemorySource,
  Router,
  LocationProvider,
  Link,
  Match,
  Redirect,
  isRedirect,
  ServerLocation
} from "./index";

let snapshot = ({ pathname, element }) => {
  let testHistory = createHistory(createMemorySource(pathname));
  let wrapper = renderer.create(
    <LocationProvider history={testHistory}>{element}</LocationProvider>
  );
  const tree = wrapper.toJSON();
  expect(tree).toMatchSnapshot();
  return tree;
};

let runWithNavigation = (element, pathname = "/") => {
  let history = createHistory(createMemorySource(pathname));
  let wrapper = renderer.create(
    <LocationProvider history={history}>{element}</LocationProvider>
  );
  const snapshot = string => {
    expect(wrapper.toJSON()).toMatchSnapshot();
  };
  return { history, snapshot, wrapper };
};

let Home = () => <div>Home</div>;
let Dash = ({ children }) => <div>Dash {children}</div>;
let Group = ({ groupId, children }) => (
  <div>
    Group: {groupId}
    {children}
  </div>
);
let PropsPrinter = props => <pre>{JSON.stringify(props, null, 2)}</pre>;
let Reports = ({ children }) => <div>Reports {children}</div>;
let AnnualReport = () => <div>Annual Report</div>;

describe("smoke tests", () => {
  it(`renders the root component at "/"`, () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      )
    });
  });

  it("renders at a path", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      )
    });
  });
});

describe("Router children", () => {
  it("ignores falsey chidlren", () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Home path="/" />
          {null}
        </Router>
      )
    });
  });
});

describe("passed props", () => {
  it("parses dynamic segments and passes to components", () => {
    snapshot({
      pathname: "/group/123",
      element: (
        <Router>
          <Home path="/" />
          <Group path="/group/:groupId" />
        </Router>
      )
    });
  });

  it("passes the matched URI to the component", () => {
    snapshot({
      pathname: "/groups/123/users/456",
      element: (
        <Router>
          <PropsPrinter path="/groups/:groupId/users/:userId" />
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

  it("parses multiple params when nested", () => {
    const Group = ({ groupId, children }) => (
      <div>
        {groupId}
        {children}
      </div>
    );
    const User = ({ userId, groupId }) => (
      <div>
        {groupId} - {userId}
      </div>
    );
    snapshot({
      pathname: `/group/123/user/456`,
      element: (
        <Router>
          <Group path="group/:groupId">
            <User path="user/:userId" />
          </Group>
        </Router>
      )
    });
  });
});

describe("route ranking", () => {
  const Root = () => <div>Root</div>;
  const Groups = () => <div>Groups</div>;
  const Group = ({ groupId }) => <div>Group Id: {groupId}</div>;
  const MyGroup = () => <div>MyGroup</div>;
  const MyGroupsUsers = () => <div>MyGroupUsers</div>;
  const Users = () => <div>Users</div>;
  const UsersSplat = ({ splat }) => <div>Users Splat: {splat}</div>;
  const User = ({ userId, groupId }) => (
    <div>
      User id: {userId}, Group Id: {groupId}
    </div>
  );
  const Me = () => <div>Me!</div>;
  const MyGroupsAndMe = () => <div>Mine and Me!</div>;
  const Fiver = ({ one, two, three, four, five }) => (
    <div>
      Fiver {one} {two} {three} {four} {five}
    </div>
  );

  const element = (
    <Router>
      <Root path="/" />
      <Groups path="/groups" />
      <Group path="/groups/:groupId" />
      <MyGroup path="/groups/mine" />
      <Users path="/groups/:groupId/users" />
      <MyGroupsUsers path="/groups/mine/users" />
      <UsersSplat path="/groups/:groupId/users/*" />
      <User path="/groups/:groupId/users/:userId" />
      <Me path="/groups/:groupId/users/me" />
      <MyGroupsAndMe path="/groups/mine/users/me" />
      <Fiver path="/:one/:two/:three/:four/:five" />
    </Router>
  );

  test("/", () => {
    snapshot({ element, pathname: "/" }); // Root
  });
  test("/groups", () => {
    snapshot({ element, pathname: "/groups" }); // Groups
  });
  test("/groups/123", () => {
    snapshot({ element, pathname: "/groups/123" }); // Group
  });
  test("/groups/mine", () => {
    snapshot({ element, pathname: "/groups/mine" }); // MyGroup
  });

  test("/groups/123/users", () => {
    snapshot({ element, pathname: "/groups/123/users" }); // Users
  });

  test("/groups/mine/users", () => {
    snapshot({ element, pathname: "/groups/mine/users" }); // MyGroupsUsers
  });

  test("/groups/123/users/456", () => {
    snapshot({ element, pathname: "/groups/123/users/456" }); // User
  });

  test("/groups/123/users/me", () => {
    snapshot({ element, pathname: "/groups/123/users/me" }); // Me
  });

  test("/groups/123/users/a/bunch/of/junk", () => {
    snapshot({
      element,
      pathname: "/groups/123/users/a/bunch/of/junk"
    }); // UsersSplat
  });

  test("/groups/mine/users/me", () => {
    snapshot({ element, pathname: "/groups/mine/users/me" }); // MyGroupsAndMe
  });

  test("/one/two/three/four/five", () => {
    snapshot({ element, pathname: "/one/two/three/four/five" }); // Fiver
  });
});

describe("nested rendering", () => {
  it("renders a nested path", () => {
    snapshot({
      pathname: "/dash/reports",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
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
          <Dash path="/dash">
            <Reports path="reports">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      )
    });
  });

  it("renders at a path with nested paths", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      )
    });
  });

  it("renders a child 'index' nested path", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="/" />
          </Dash>
        </Router>
      )
    });
  });

  it("yo dawg", () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/" />
              <Reports path=":reportId" />
            </Dash>
          </Dash>
        </Router>
      )
    });
  });

  it("yo dawg again", () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/" />
              <Reports path="reports/:reportId" />
            </Dash>
          </Dash>
        </Router>
      )
    });
  });

  it("matches multiple nested / down to a child with a path", () => {
    snapshot({
      pathname: "/yo",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/yo" />
            </Dash>
          </Dash>
        </Router>
      )
    });
  });
});

describe("disrespect", () => {
  it("has complete disrespect for leading and trailing slashes", () => {
    snapshot({
      pathname: "dash/reports/annual/",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="dash">
            <Reports path="/reports/">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      )
    });
  });
});

describe("links", () => {
  it("accepts an innerRef prop", done => {
    let ref;
    let div = document.createElement("div");
    ReactDOM.render(
      <Link to="/" innerRef={node => (ref = node)} />,
      div,
      () => {
        expect(ref).toBeInstanceOf(HTMLAnchorElement);
        ReactDOM.unmountComponentAtNode(div);
        done();
      }
    );
  });

  it("forwards refs", done => {
    let ref;
    let div = document.createElement("div");
    ReactDOM.render(<Link to="/" ref={node => (ref = node)} />, div, () => {
      expect(ref).toBeInstanceOf(HTMLAnchorElement);
      ReactDOM.unmountComponentAtNode(div);
      done();
    });
  });

  it("renders links with relative hrefs", () => {
    const Parent = ({ children }) => (
      <div>
        <h1>Parent</h1>
        <Link to="reports">/dash/reports</Link>
        {children}
      </div>
    );

    const Child = () => (
      <div>
        <h2>Child</h2>
        <Link to="../">/dash</Link>
      </div>
    );

    snapshot({
      pathname: "/dash/reports",
      element: (
        <Router>
          <Parent path="dash">
            <Child path="reports" />
            <Child path="charts" />
          </Parent>
        </Router>
      )
    });
  });

  it("uses the right href in multiple root paths", () => {
    const Parent = ({ uri, children }) => (
      <div>
        <div>Parent URI: {uri}</div>
        {children}
      </div>
    );

    const Child = ({ uri }) => (
      <div>
        <div>Child URI: {uri}</div>
        <Link to="three">/one/two/three</Link>
        <Link to="..">/one</Link>
        <Link to="../..">/</Link>
      </div>
    );

    snapshot({
      pathname: "/one/two",
      element: (
        <Router>
          <Parent path="/">
            <Parent path="/">
              <Parent path="one">
                <Child path="two" />
              </Parent>
            </Parent>
          </Parent>
        </Router>
      )
    });
  });
});

describe("transitions", () => {
  it("transitions pages", async () => {
    const {
      snapshot,
      history: { navigate }
    } = runWithNavigation(
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
});

describe("relative navigate prop", () => {
  it("navigates relative", async () => {
    let relativeNavigate;

    const User = ({ children, navigate, userId }) => {
      relativeNavigate = navigate;
      return (
        <div>
          User:{userId}
          {children}
        </div>
      );
    };

    const Settings = () => <div>Settings</div>;

    const { snapshot } = runWithNavigation(
      <Router>
        <User path="user/:userId">
          <Settings path="settings" />
        </User>
      </Router>,
      "/user/123"
    );
    snapshot();
    await relativeNavigate("settings");
    snapshot();
  });

  it("navigates relative", () => {});
});

describe("nested routers", () => {
  it("allows arbitrary Router nesting through context", () => {
    const PageWithNestedApp = () => (
      <div>
        Home
        <ChatApp />
      </div>
    );

    const ChatApp = () => (
      <Router>
        <ChatHome path="/home" />
      </Router>
    );

    const ChatHome = () => <div>Chat Home</div>;

    snapshot({
      pathname: `/chat/home`,
      element: (
        <Router>
          <PageWithNestedApp path="/chat/*" />
        </Router>
      )
    });
  });
});

describe("Match", () => {
  it("matches a path", () => {
    snapshot({
      pathname: `/groups/123`,
      element: (
        <Match path="/groups/:groupId">
          {props => <PropsPrinter {...props} />}
        </Match>
      )
    });
  });
});

// React 16.4 is buggy https://github.com/facebook/react/issues/12968
describe.skip("ServerLocation", () => {
  let App = () => (
    <Router>
      <Home path="/" />
      <Group path="/groups/:groupId" />
      <Redirect from="/g/:groupId" to="/groups/:groupId" />
    </Router>
  );

  it("works", () => {
    expect(
      renderToString(
        <ServerLocation url="/">
          <App />
        </ServerLocation>
      )
    ).toMatchSnapshot();

    expect(
      renderToString(
        <ServerLocation url="/groups/123">
          <App />
        </ServerLocation>
      )
    ).toMatchSnapshot();
  });

  test("redirects", () => {
    let redirectedPath = "/g/123";
    let markup;
    try {
      markup = renderToString(
        <ServerLocation url={redirectedPath}>
          <App />
        </ServerLocation>
      );
    } catch (error) {
      expect(markup).not.toBeDefined();
      expect(isRedirect(error)).toBe(true);
      expect(error.uri).toBe("/groups/123");
    }
  });
});
