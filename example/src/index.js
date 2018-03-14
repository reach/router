import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { createCache, SimpleCache } from "simple-cache-provider";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

let cache;

const init = () => {
  cache = createCache(init);
  root.render(
    <SimpleCache.Provider value={cache}>
      <App />
    </SimpleCache.Provider>
  );
};

init();
