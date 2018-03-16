import React from "react";
import { SimpleCache } from "simple-cache-provider";

export default Comp => props => (
  <SimpleCache.Consumer>
    {cache => <Comp {...props} cache={cache} />}
  </SimpleCache.Consumer>
);
