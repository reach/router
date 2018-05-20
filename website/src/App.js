import React from "react";
import { hot } from "react-hot-loader";
import { Router, Link } from "@reactions/router";
import Nav from "./Nav";
import { BLACK, SMALL_BREAK, SIDEBAR_SIZE, TOPBAR_SIZE } from "./theme";
import A11y from "./api/Link.md";

let App = ({ children }) => (
  <div>
    <Nav />
    <div
      css={{
        marginLeft: SIDEBAR_SIZE,
        [SMALL_BREAK]: {
          marginLeft: 0,
          marginTop: TOPBAR_SIZE
        }
      }}
    >
      {children}
    </div>
  </div>
);

let Home = () => (
  <div css={{ padding: 20 }}>
    <A11y />
    <iiframe
      style={{
        display: "block",
        margin: "auto",
        border: 0,
        width: "840px",
        height: "472.5px",
        maxWidth: "100%",
        boxShadow: "0 5px 30px hsla(0, 0%, 0%, 0.33)"
      }}
      title="Introduction Video"
      src="https://www.youtube.com/embed/gjOzVlCmeKk?rel=0"
      allow="autoplay; encrypted-media"
      allowFullScreen
    />
    <p
      css={{
        textAlign: "center",
        fontSize: "150%",
        margin: "60px auto"
      }}
    >
      Reach Router keeps your React UI and the URL in sync.
    </p>
    <ul
      css={{
        fontSize: "120%",
        "@media(max-width: 800px)": {
          fontSize: "100%"
        }
      }}
    >
      <li>Dead simple API</li>
      <li>React Async ready, compatible back to React 14</li>
      <li>Kilobyte conscious, weighing ~4kb</li>
      <li>
        Relative links let you build large-scale apps with embedded routers
      </li>
      <li>
        Ranked routes do the right thing, no messing around with route ordering
      </li>
      <li>Accessible by default</li>
      <li>And more...</li>
    </ul>
  </div>
);

let Tutorial = ({ id }) => <div>Tutorial {id}</div>;

let API = ({ id }) => <div>API {id}</div>;

let Page = ({ id }) => <div>Page {id}</div>;

let Example = ({ id }) => (
  <iframe
    title="example"
    src="https://codesandbox.io/embed/1on84p30nj?fontsize=13"
    css={{ display: "block", width: "100%", border: 0, height: "100vh" }}
    sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
  />
);

let Root = () => (
  <div css={{ color: BLACK }}>
    <Router>
      <App path="/">
        <Home path="/" />
        <Example path="example/:id" />
        <Tutorial path="tutorial/:id" />
        <API path="api/:id" />
        <Page path=":id" />
      </App>
    </Router>
  </div>
);

export default hot(module)(Root);
