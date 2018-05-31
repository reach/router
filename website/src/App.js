import React, { Fragment } from "react";
import Component from "@reactions/component";
import { hot } from "react-hot-loader";
import { Router, Link } from "@reach/router";
import Nav from "./Nav";
import {
  BLACK,
  BLUE,
  DARK_BLUE,
  SMALL_BREAK,
  SIDEBAR_SIZE,
  TOPBAR_SIZE
} from "./theme";

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

let DocumentTitle = ({ title }) => (
  <Component
    title={title}
    didMount={() => (document.title = title)}
    didUpdate={({ prevProps }) => {
      if (prevProps.title !== title) {
        document.title = title;
      }
    }}
  />
);

let Home = () => (
  <Fragment>
    <DocumentTitle title="Reach Router - Next Generation Routing for React" />
    <div css={{ padding: 0, paddingBottom: 80 }}>
      <div css={{ padding: 40 }}>
        <iframe
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
          src="https://www.youtube.com/embed/3tgz1E4MsAk?rel=0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
      <MarkdownRoute dir="pages" filename="intro" />
    </div>
  </Fragment>
);

let tutorialLinks = [
  "01-intro",
  "02-installation",
  "03-link",
  "04-router",
  "05-url-parameters",
  "06-nesting",
  "07-index-routes",
  "08-default-routes",
  "09-navigate",
  "10-next-steps"
];

let tutorialSandboxen = [
  "rwo3jz5vno",
  "rwo3jz5vno",
  "rwo3jz5vno",
  "7k4w6yw881",
  "1zpv672004",
  "k9lzn45065",
  "94mrvx7o14",
  "w0olqr76r5",
  "p5wl790y20",
  "n01l63w4nl"
];

let Tutorial = ({ id, location }) => (
  <div
    css={{
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}
  >
    <div css={{ order: 1, flex: 1, overflow: "auto" }}>
      <div css={{ textAlign: "center", padding: 5 }}>
        <Link
          css={{
            fontSize: "80%",
            opacity: 0.5,
            color: "inherit",
            textDecoration: "none",
            display: "inline-block"
          }}
          to={location.search === "?fullpage" ? "." : "?fullpage"}
          replace
        >
          {location.search === "?fullpage" ? "Show" : "Hide"} Sandbox
        </Link>
      </div>
      <div
        css={{
          overflow: "auto"
        }}
      >
        <div
          css={{
            lineHeight: 1.3,
            padding: "10px 20px 80px 20px",
            " .markdown": { display: "block" },
            " .markdown > h1": {
              marginTop: 0,
              marginBottom: 0,
              fontSize: "100%"
            },
            " .markdown > *:not(pre):not(h1):not(h2)": {
              display: "block",
              clear: "both",
              float: "left",
              width: "400px",
              paddingRight: "40px"
            },
            " .markdown > pre": {
              float: "left",
              clear: "right",
              whiteSpace: "pre-wrap"
            }
          }}
        >
          <MarkdownPage dir="tutorial" filename={id} css={{}} />
        </div>
        <div css={{ clear: "both" }} />
        {(() => {
          let next = tutorialLinks[tutorialLinks.indexOf(id) + 1];
          return next ? (
            <Link
              to={`../${next}`}
              css={{
                clear: "both",
                display: "inline-block",
                padding: "10px 20px",
                margin: "10px 20px",
                background: BLUE,
                textDecoration: "none",
                color: "white",
                ":active": {
                  position: "relative",
                  top: "1px",
                  left: "1px"
                }
              }}
            >
              Next →
            </Link>
          ) : null;
        })()}
        <div css={{ height: 40 }} />
      </div>
    </div>
    <iframe
      title="Codesandbox"
      src={`https://codesandbox.io/embed/${
        tutorialSandboxen[tutorialLinks.indexOf(id)]
      }?fontsize=13`}
      css={{
        display: location.search === "?fullpage" ? "none" : "block",
        width: "100%",
        border: 0,
        height: "60%"
      }}
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    />
  </div>
);

class AsyncModule extends React.Component {
  state = { mod: null };

  componentDidMount() {
    this.props.load().then(mod => {
      this.setState({ mod });
    });
  }

  render() {
    return this.props.children(this.state.mod);
  }
}

let MarkdownRoute = ({ dir, filename }) => (
  <div
    css={{
      padding: 40,
      maxWidth: 800,
      lineHeight: 1.3,
      " .markdown > hr": {
        margin: "4em 0",
        border: 0,
        height: 1,
        background: "#ccc"
      },
      " .markdown > h2": {
        marginTop: "2em"
      },
      " .markdown > h3": {
        opacity: 0.75,
        marginTop: "2em"
      },
      " .markdown > p.category": {
        marginTop: "-1.5em",
        fontWeight: "bold",
        opacity: "0.5",
        fontStyle: "italic"
      }
    }}
  >
    <MarkdownPage
      dir={dir}
      filename={filename}
      css={{ padding: 40, maxWidth: 800 }}
    />
  </div>
);

let MarkdownPage = ({ dir, filename, css }) => (
  <AsyncModule
    key={dir + filename}
    load={() => {
      return import(`./markdown/${dir}/${filename}.md`);
    }}
  >
    {mod =>
      mod ? (
        <Fragment>
          <DocumentTitle title={`Reach Router - ${mod.title}`} />
          <mod.default />
        </Fragment>
      ) : (
        <div>Loading...</div>
      )
    }
  </AsyncModule>
);

let exampleSandboxen = {
  basic: "lyzwj8w0qz",
  "url-params": "qqovozny8q",
  "nested-routes": "18j1oprw33",
  "active-links": "mjpw966808",
  "relative-links": "q9928xjo4w",
  "multiple-routers": "ppw7rn952j",
  "embedded-routers": "xlj73mjy0w",
  animation: "8xrzkk42j2",
  "location-state": "o916kx8rn9",
  "query-params": "jz89k2jv79"
};

let Example = ({ id }) => (
  <Fragment>
    <DocumentTitle title={`Reach Router - Example - ${id}`} />
    <iframe
      title="example"
      src={`https://codesandbox.io/embed/${exampleSandboxen[id]}?fontsize=13`}
      css={{
        display: "block",
        width: "100%",
        border: 0,
        height: "100vh"
      }}
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    />
  </Fragment>
);

let Root = () => (
  <div css={{ color: BLACK }}>
    <Router basepath={BASEPATH}>
      <App path="/">
        <Home path="/" />
        <Example path="example/:id" />
        <Tutorial path="tutorial/:id" />
        <MarkdownRoute dir="api" path="api/:filename" />
        <MarkdownRoute dir="pages" path=":filename" />
      </App>
    </Router>
  </div>
);

export default hot(module)(Root);
