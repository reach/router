// WORKS! (!?!?)
import React from "react";
import { render } from "react-dom";
import { Router, browserHistory } from "@reactions/router";

import "./stubs/COURSES";

const routes = [
  {
    path: "/",
    component: require("./components/App").default,
    indexRoute: { component: require("./components/Dashboard").default },
    childRoutes: [
      require("./routes/Calendar"),
      require("./routes/Course"),
      require("./routes/Grades"),
      require("./routes/Messages"),
      require("./routes/Profile")
    ]
  }
];

render(
  <Router history={browserHistory} routes={routes} />,
  document.getElementById("root")
);
