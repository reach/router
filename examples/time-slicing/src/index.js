////////////////////////////////////////////////////////////////////////////////
// Adapted from Dan Abramov's demo at JSConf Iceland
// https://www.youtube.com/watch?v=v6iR3Zk4oDY

import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import Charts from "./Charts";
import { Router } from "@reactions/router";
import "./index.css";

////////////////////////////////////////////////////////////////////////////////
// You can toggle between sync and async updates by switching the value of
// Wrapper here

// const Wrapper = 'div' // use this for sync mode
const Wrapper = React.unstable_AsyncMode; // this for async

////////////////////////////////////////////////////////////////////////////////
// Previously, syncing an input to the URL would cause the app to become
// unresponsive with each URL update (because the whole app re-renders on
// key press D:), but because Router uses deferred state updates, in AsyncMode
// you can navigate multiple times quickly w/o causing performance issues
class App extends React.PureComponent {
  handleChange = e => {
    const value = e.target.value;
    // also, you can navigate to relative paths, passing in just a query string
    // will keep us at the current URL with a new query :D
    this.props.navigate(`?${encodeURIComponent(value)}`, { replace: true });
  };

  render() {
    const data = getStreamData(this.props.location.search)
    return (
      <div className="container">
        <input
          className={"input"}
          placeholder="longer input → more components and DOM nodes"
          defaultValue={decodeURIComponent(this.props.location.search.substr(1))}
          onChange={this.handleChange}
        />
        <div className="demo">
          <div className="demoInner">
            <Charts data={data} />
          </div>
        </div>
      </div>
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// This is just junk to make the charts big
let cachedData = new Map();

let getStreamData = input => {
  if (cachedData.has(input)) {
    return cachedData.get(input);
  }
  const multiplier = input.length !== 0 ? input.length : 1;
  const complexity =
    parseInt(window.location.search.substring(1), 10) / 100 * 25 || 25;
  const data = _.range(5).map(t =>
    _.range(complexity * multiplier).map((j, i) => {
      return {
        x: j,
        y: (t + 1) * _.random(0, 255)
      };
    })
  );
  cachedData.set(input, data);
  return data;
}

ReactDOM.render(
  <Wrapper>
    <Router>
      <App path="/" />
    </Router>
  </Wrapper>,
  document.getElementById("root")
);

