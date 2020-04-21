/* global VERSION */
import React from "react";
import { Link, Match } from "@reach/router";
import Logo from "./Logo";
import {
  BLACK,
  BLUE,
  SMALL_BREAK,
  SMALL_BREAK_QUERY,
  SIDEBAR_SIZE,
  TOPBAR_SIZE
} from "./theme";
import Component from "@reactions/component";
import scrollIntoView from "scroll-into-view-if-needed";
import Media from "react-media";

let Nav = () => (
  <Media query={SMALL_BREAK_QUERY}>
    {isSmall => (
      <Match path="*">
        {({ location }) => (
          <Component
            initialState={{ sidebarOpen: false }}
            isSmall={isSmall}
            location={location}
            didUpdate={({ prevProps, state, setState }) => {
              if (
                state.sidebarOpen &&
                (prevProps.location !== location ||
                  prevProps.isSmall !== isSmall)
              ) {
                setState({ sidebarOpen: false });
              }
            }}
          >
            {({ state, setState }) => (
              <div>
                {isSmall && (
                  <div
                    css={{
                      background: BLACK,
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: TOPBAR_SIZE
                    }}
                  >
                    <button
                      onClick={() =>
                        setState(({ sidebarOpen }) => ({
                          sidebarOpen: !sidebarOpen
                        }))
                      }
                    >
                      toggle
                    </button>
                  </div>
                )}
                <div
                  css={{
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    overflow: "auto",
                    width: SIDEBAR_SIZE,
                    borderRight: "solid 2px black",
                    backgroundColor: BLACK,
                    color: "white",
                    " a": { color: "white" },
                    [SMALL_BREAK]: {
                      top: TOPBAR_SIZE
                    },
                    transition: "background-color 300ms, left 200ms"
                  }}
                  style={{
                    left: isSmall && !state.sidebarOpen ? -SIDEBAR_SIZE : 0
                  }}
                >
                  <div css={{ position: "sticky", overflow: "auto" }}>
                    <Logo />

                    <div css={{ padding: 20 }}>
                      <div css={{ fontSize: "85%" }}>
                        v{VERSION} -{" "}
                        <a href="https://github.com/reach/router">GitHub</a>
                      </div>

                      <Header>About</Header>

                      <NavLink to="./">Features</NavLink>
                      <NavLink to="accessibility">Accessibility</NavLink>
                      <NavLink to="credits">Credits and Trade-offs</NavLink>

                      <Header>Examples</Header>
                      <NavLink to="example/basic">Basic Usage</NavLink>
                      <NavLink to="example/url-params">URL Params</NavLink>
                      <NavLink to="example/nested-routes">
                        Nested Routes
                      </NavLink>
                      <NavLink to="example/active-links">Active Links</NavLink>
                      <NavLink to="example/relative-links">
                        Relative Links
                      </NavLink>
                      <NavLink to="example/multiple-routers">
                        Multiple Routers
                      </NavLink>
                      <NavLink to="example/embedded-routers">
                        Embedded Routers
                      </NavLink>
                      <NavLink to="example/animation">Animation</NavLink>

                      <Header>Tutorial</Header>
                      <NavLink to="tutorial/01-intro">Introduction</NavLink>
                      <NavLink to="tutorial/02-installation">
                        Installation
                      </NavLink>
                      <NavLink to="tutorial/03-link">Link</NavLink>
                      <NavLink to="tutorial/04-router">Router</NavLink>
                      <NavLink to="tutorial/05-url-parameters">
                        URL Parameters
                      </NavLink>
                      <NavLink to="tutorial/06-nesting">Nesting</NavLink>
                      <NavLink to="tutorial/07-index-routes">
                        Index Routes
                      </NavLink>
                      <NavLink to="tutorial/08-default-routes">
                        Default Routes
                      </NavLink>
                      <NavLink to="tutorial/09-navigate">
                        Navigating Imperatively
                      </NavLink>
                      <NavLink to="tutorial/10-next-steps">Next Steps</NavLink>

                      <Header>Guides</Header>
                      <NavLink to="server-config">Server Configuration</NavLink>
                      <NavLink to="nesting">Nesting and Relative Links</NavLink>
                      <NavLink to="ranking">Path Ranking</NavLink>
                      <NavLink to="large-scale">Large Scale Apps</NavLink>
                      <NavLink to="server-rendering">Server Rendering</NavLink>
                      <NavLink to="typescript">Usage with TypeScript</NavLink>

                      <Header>Primary API</Header>
                      <div
                        css={{
                          fontFamily: `'SFMono-Regular', Consolas, 'Roboto Mono', 'Droid Sans Mono', 'Liberation Mono', Menlo, Courier, monospace`
                        }}
                      >
                        <NavLink to="api/Router">Router</NavLink>
                        <NavLink to="api/Link">Link</NavLink>
                        <NavLink to="api/RouteComponent">
                          Route Component
                        </NavLink>
                        <NavLink to="api/Redirect">Redirect</NavLink>
                        <NavLink to="api/Match">Match</NavLink>
                        <NavLink to="api/navigate">navigate</NavLink>
                      </div>

                      <Header>Hooks API</Header>
                      <div
                        css={{
                          fontFamily: `'SFMono-Regular', Consolas, 'Roboto Mono', 'Droid Sans Mono', 'Liberation Mono', Menlo, Courier, monospace`
                        }}
                      >
                        <NavLink to="api/useLocation">useLocation</NavLink>
                        <NavLink to="api/useMatch">useMatch</NavLink>
                        <NavLink to="api/useNavigate">useNavigate</NavLink>
                        <NavLink to="api/useParams">useParams</NavLink>
                      </div>

                      <Header>Additional API</Header>
                      <div
                        css={{
                          fontFamily: `'SFMono-Regular', Consolas, 'Roboto Mono', 'Droid Sans Mono', 'Liberation Mono', Menlo, Courier, monospace`
                        }}
                      >
                        <NavLink to="api/Location">Location</NavLink>
                        <NavLink to="api/LocationProvider">
                          LocationProvider
                        </NavLink>
                        <NavLink to="api/ServerLocation">
                          ServerLocation
                        </NavLink>
                        <NavLink to="api/createHistory">createHistory</NavLink>
                        <NavLink to="api/createMemorySource">
                          createMemorySource
                        </NavLink>
                        <NavLink to="api/isRedirect">isRedirect</NavLink>
                        <NavLink to="api/redirectTo">redirectTo</NavLink>
                      </div>
                    </div>
                    <footer
                      css={{ fontSize: "66%", marginTop: 60, opacity: 0.66 }}
                    >
                      <p>Copyright &copy; 2020 Reach Tech</p>
                    </footer>
                  </div>
                </div>
              </div>
            )}
          </Component>
        )}
      </Match>
    )}
  </Media>
);

let Header = ({ children }) => (
  <h2
    css={{
      fontWeight: "200",
      fontStyle: "italic",
      fontSize: "100%",
      marginTop: 30,
      marginBottom: 10,
      opacity: 0.8
    }}
  >
    {children}
  </h2>
);

let NavLink = ({ to, ...props }) => (
  <Match path={to}>
    {({ match }) => (
      <Component
        initialState={{ refs: { node: null } }}
        didUpdate={({
          state: {
            refs: { node }
          }
        }) => {
          if (match) {
            scrollIntoView(node, {
              behavior: "smooth",
              scrollMode: "if-needed",
              block: "nearest",
              inline: "nearest"
            });
          }
        }}
      >
        {({ state }) => (
          <div ref={n => (state.refs.node = n)}>
            <Link
              to={to}
              {...props}
              css={{
                textDecoration: "none",
                display: "block",
                padding: "5px 10px 5px 20px",
                fontSize: "85%",
                position: "relative",
                ...(match
                  ? {
                      ":before": {
                        position: "absolute",
                        content: "•",
                        left: 0
                      }
                    }
                  : null),
                ":hover": {
                  textDecoration: "underline"
                }
              }}
            />
          </div>
        )}
      </Component>
    )}
  </Match>
);

export default Nav;
