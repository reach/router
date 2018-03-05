import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Router, Link } from "@reactions/router";

const Main = () => (
  <div>
    <h1>Home</h1>
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

const Company = ({ url }) =>
  console.log(url) || (
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

class App extends Component {
  render() {
    return (
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="company">Company</Link>
          </li>
        </ul>
        <Router>
          <Main path="/" />
          <Company path="company/*" />
        </Router>
      </div>
    );
  }
}

export default App;
