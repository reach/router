import * as React from "react";
import { render } from "react-dom";
import { Link, Router } from "../";

render(
  <Router>
    <Link to="/somepath" rel="noopener noreferrer" target="_blank" />
  </Router>,
  document.getElementById("app-root")
);
