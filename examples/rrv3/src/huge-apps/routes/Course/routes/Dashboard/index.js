module.exports = {
  path: "/",
  getComponent(nextState, cb) {
    require.ensure([], require => {
      cb(null, require("./components/Dashboard").default);
    });
  }
};
