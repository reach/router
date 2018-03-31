import React from "react";
import renderer from "react-test-renderer";
import { renderToString } from "react-dom/server";

import {
  createHistory,
  createMemorySource,
  Router,
  LocationProvider,
  Link,
  MatchPath,
  Redirect,
  isRedirect,
  ServerRenderContext,

  // compat
  Route,
  IndexRoute,
  browserHistory
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

describe("React Router v3 Compatibility", () => {
  const App = ({ children }) => (
    <div>
      <ul>
        <li>
          <Link to="/user/123" activeClassName="active">
            Bob
          </Link>
        </li>
        <li>
          <Link to="/user/abc" activeClassName="active">
            Sally
          </Link>
        </li>
      </ul>
      {children}
    </div>
  );

  const User = ({ children, params: { userID } }) => (
    <div className="User">
      <h1>User id: {userID}</h1>
      <ul>
        <li>
          <Link to={`/user/${userID}/tasks/foo`} activeClassName="active">
            foo task
          </Link>
        </li>
        <li>
          <Link to={`/user/${userID}/tasks/bar`} activeClassName="active">
            bar task
          </Link>
        </li>
      </ul>
      {children}
    </div>
  );

  const Task = ({ params: { userID, taskID } }) => (
    <div className="Task">
      <h2>User ID: {userID}</h2>
      <h3>Task ID: {taskID}</h3>
    </div>
  );

  const Index = () => <h2>Index</h2>;

  const router = (
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Index} />
        <Route path="user/:userID" component={User}>
          <Route path="tasks/:taskID" component={Task} />
        </Route>
      </Route>
    </Router>
  );

  it("renders generally", () => {
    snapshot({
      pathname: "/",
      element: router
    });
  });

  it("passes url params", () => {
    snapshot({
      pathname: "/user/bob",
      element: router
    });
  });

  it("renders deeply nested routes", () => {
    snapshot({
      pathname: "/user/bob/tasks/123",
      element: router
    });
  });

  describe("onEnter", () => {
    it("passes props to onEnter", done => {
      const assertOnEnter = (nextState, replace) => {
        expect(nextState).toEqual({
          location: { pathname: "/foo/test" },
          params: { bar: "test" }
          // routes key not supported :\
        });
        done();
      };

      let Comp = () => null;
      let history = createHistory(createMemorySource("/foo/test"));
      let wrapper = renderer.create(
        <LocationProvider history={history}>
          <Router>
            <Route path="/foo/:bar" onEnter={assertOnEnter} component={Comp} />
          </Router>
        </LocationProvider>
      );
    });

    it.only("can redirect", done => {
      class Whiz extends React.Component {
        componentDidMount() {
          expect(wrapper).toMatchSnapshot();
          done();
        }
        render() {
          return null;
        }
      }
      const Foo = () => <div>foo</div>;

      let source = createMemorySource("/foo/bar");
      let history = createHistory(source);

      let wrapper = renderer.create(
        <LocationProvider history={history}>
          <Router>
            <Route component={Whiz} path="/wiz/bang" />
            <Route
              component={Foo}
              path="/foo/bar"
              onEnter={(_, replace) => {
                replace("/wiz/bang");
              }}
            />
          </Router>
        </LocationProvider>
      );
    });
  });
});

// const renderTestSequence = (subject steps) => {
//   class Assert extends React.Component {
//     componentDidMount() {
//       this.assert();
//     }

//     componentDidUpdate() {
//       this.assert();
//     }

//     assert() {
//       const nextStep = steps.shift();
//       if (nextStep) {
//         nextStep(this.props);
//       }
//     }

//     render() {
//       return this.props.children;
//     }
//   }

// }
