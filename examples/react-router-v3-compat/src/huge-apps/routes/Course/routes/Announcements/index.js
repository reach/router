module.exports = {
  path: "announcements",

  getComponent(nextState, cb) {
    require.ensure([], require => {
      cb(null, require("./components/Announcements").default);
    });
  }
};
