/*globals COURSES:true */
import React, { Component } from "react";
import Dashboard from "./Dashboard";
import Nav from "./Nav";

const styles = {};

styles.sidebar = {
  float: "left",
  width: 200,
  padding: 20,
  borderRight: "1px solid #aaa",
  marginRight: 20
};

class Course extends Component {
  render() {
    let { children, params } = this.props;
    let course = COURSES[params.courseId];

    return (
      <div>
        <h2>{course.name}</h2>
        <Nav course={course} />
        {children}
      </div>
    );
  }
}

export default Course;
