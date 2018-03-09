import React, { Component } from "react";
import "./App.css";
// import { Router, Link } from "@reactions/router";
import { Router, Link } from "./router";

const Main = ({ children }) => (
  <div>
    <h1>Home</h1>
    {children}
  </div>
);

const About = () => (
  <div>
    <h2>About</h2>
  </div>
);

const Contact = () => (
  <div>
    <h2>Contact</h2>
  </div>
);

const Company = ({ url }) => (
  <div>
    <h1>Company</h1>
    <ul>
      <li>
        <Link to="contact">Contact</Link>
      </li>
      <li>
        <Link to="about">About</Link>
      </li>
    </ul>
    <Router basepath={url}>
      <About path="about" />
      <Contact path="contact" />
    </Router>
  </div>
);

const Index = () => <div>Index</div>;

class App extends Component {
  render() {
    return (
      <Router>
        <Main path="/">
          <Index path="/" />
          <Company path="company" />
        </Main>
      </Router>
    );
  }
}

export default App;
