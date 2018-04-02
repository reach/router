import React, { Component } from "react";
import GlobalNav from "./GlobalNav";
import "./styles.css";

class App extends Component {
  render() {
    return (
      <div>
        <GlobalNav />
        <div style={{ padding: 20 }}>{this.props.children}</div>
      </div>
    );
  }
}

export default App;
