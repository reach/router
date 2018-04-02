module.exports = {
  path: "course/:courseId",

  getChildRoutes(partialNextState, cb) {
    require.ensure([], require => {
      cb(null, [
        require("./routes/Dashboard"),
        require("./routes/Announcements"),
        require("./routes/Assignments"),
        require("./routes/Grades")
      ]);
    });
  },

  getComponent(nextState, cb) {
    require.ensure([], require => {
      cb(null, require("./components/Course").default);
    });
  }
};
