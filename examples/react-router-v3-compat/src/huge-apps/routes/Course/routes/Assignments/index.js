module.exports = {
  path: "assignments",

  getComponent(nextState, cb) {
    require.ensure([], require => {
      cb(null, require("./components/Assignments").default);
    });
  }
};
