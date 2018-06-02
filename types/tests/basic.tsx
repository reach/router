import * as React from "react";
import { render } from "react-dom";
import { RouteComponentProps, Router } from "../";

type DashParams = { id: string };

let Home = (props: RouteComponentProps) => <div>Home</div>;

let Dash = (props: RouteComponentProps<DashParams>) => (
  <div>Dash for item ${props.id}</div>
);

render(
  <Router>
    <Home path="/" />
    <Dash path="/" />
  </Router>,
  document.getElementById("app-root")
);
