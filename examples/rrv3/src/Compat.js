import React, { Children, cloneElement } from "react";
import { Router, Link, MatchPath, Redirect } from "@reactions/router";
import * as qs from "query-string";
import Component from "@reactions/component";

const CompatRouter = ({ children, ...props }) => (
  <Router {...props}>
    {Children.map(
      children,
      child =>
        console.log("ayy", child.props.path) ||
        cloneElement(child, {
          key: child.props.path,
          children: undefined,
          _children: child.props.children
        })
    )}
  </Router>
);

class Route extends React.Component {
  constructor(props, context) {
    super(props, context);
    console.log(this.props.path, this.props.onEnter);
    this.state = {
      onEnterLoaded: this.props.onEnter ? false : true
    };
  }

  componentDidMount() {
    const {
      component: Comp,
      location,
      navigate,
      path,
      uri,
      onEnter,
      _children,
      ...props
    } = this.props;
    if (onEnter) {
      const nextState = { location, params: props };
      const replace = pathOrLocation => {
        if (typeof pathOrLocation === "object") {
          const { pathname, state } = pathOrLocation;
          console.log(pathname, state);
          return navigate(pathname, { state, replace: true });
        } else {
          return navigate(pathOrLocation, { replact: true });
        }
      };
      onEnter(nextState, replace, () => {
        this.setState({ onEnterLoaded: true });
      });
    }
  }

  render() {
    const {
      component: Comp,
      location,
      navigate,
      path,
      uri,
      onEnter,
      _children,
      ...props
    } = this.props;

    addQuery(location);

    return this.state.onEnterLoaded ? (
      <Comp {...props} location={location} params={props}>
        {_children ? <CompatRouter>{_children}</CompatRouter> : null}
      </Comp>
    ) : (
      <div>Waiting for onEnter</div>
    );
  }
}

const IndexRoute = ({
  component: Component,
  location,
  navigate,
  path,
  uri,
  ...props
}) => {
  addQuery(location);
  return <Component {...props} location={location} />;
};
IndexRoute.defaultProps = { path: "/" };

function addQuery(location) {
  location.query = qs.parse(location.search.substring(1));
}

function isQueryIsActive(query, activeQuery) {
  if (activeQuery == null) return query == null;

  if (query == null) return true;

  return deepEqual(query, activeQuery);
}

function deepEqual(a, b) {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => deepEqual(item, b[index]))
    );
  }

  if (typeof a === "object") {
    for (let p in a) {
      if (!Object.prototype.hasOwnProperty.call(a, p)) {
        continue;
      }

      if (a[p] === undefined) {
        if (b[p] !== undefined) {
          return false;
        }
      } else if (!Object.prototype.hasOwnProperty.call(b, p)) {
        return false;
      } else if (!deepEqual(a[p], b[p])) {
        return false;
      }
    }

    return true;
  }

  return String(a) === String(b);
}

function isLinkActive(match, to, query, location, onlyActiveOnIndex) {
  if (!match) return false;
  const queryIsActive = isQueryIsActive(query, location.query);
  if (onlyActiveOnIndex) {
    return queryIsActive && to === location.pathname;
  } else {
    return queryIsActive;
  }
}

const CompatLink = ({
  to,
  style,
  activeStyle,
  className = "",
  activeClassName = "",
  onlyActiveOnIndex = false,
  ...props
}) => {
  let query = null;
  if (typeof to === "object") {
    query = to.query;
    to = to.pathname;
  }
  return (
    <MatchPath path={`${to}/*`}>
      {({ match, location }) => {
        const href = query ? [to, qs.stringify(query)].join("?") : to;
        const linkIsActive = isLinkActive(
          match,
          to,
          query,
          location,
          onlyActiveOnIndex
        );
        return (
          <Link
            to={href}
            {...props}
            style={linkIsActive ? { ...style, ...activeStyle } : style}
            className={
              isLinkActive ? [className, activeClassName].join(" ") : className
            }
          />
        );
      }}
    </MatchPath>
  );
};

const IndexLink = props => <CompatLink {...props} onlyActiveOnIndex={true} />;

const browserHistory = null;

const withRouter = Comp => props => (
  <MatchPath path="/*">
    {({ location }) => <Comp {...props} location={location} />}
  </MatchPath>
);

export {
  CompatRouter as Router,
  Route,
  IndexRoute,
  CompatLink as Link,
  IndexLink,
  browserHistory,
  Redirect,
  withRouter
};
