import { pick, match, resolve } from "./utils";

test("pick", () => {
  expect(pick(routes, "/").route.value).toBe("Root");
  expect(pick(routes, "/groups/main/users/me").route.value).toBe(
    "MainGroupMe"
  );
  expect(pick(routes, "/groups/123/users/456").route.value).toBe(
    "GroupUser"
  );
  expect(pick(routes, "/one/two/three/four/five").route.value).toBe(
    "Fiver"
  );
  expect(pick(routes, "/groups/main/users").route.value).toBe(
    "MainGroupUsers"
  );
  expect(pick(routes, "/groups/123/users").route.value).toBe(
    "GroupUsers"
  );
  expect(pick(routes, "/groups/main").route.value).toBe("MainGroup");
  expect(pick(routes, "/groups/123").route.value).toBe("Group");
  expect(pick(routes, "/groups").route.value).toBe("Groups");
  expect(pick(routes, "/files/some/long/path").route.value).toBe(
    "FilesDeep"
  );
  expect(pick(routes, "/files").route.value).toBe("Files");
  expect(pick(routes, "/no/where").route.value).toBe("Default");
});

test("match", () => {
  expect(match("/foo/:bar", "/foo/hello")).toMatchSnapshot();
});

test("pick return value", () => {
  expect(pick(routes, "/one/two/three/four/five")).toMatchSnapshot();
});

test("splat return value", () => {
  expect(pick(routes, "/files/some/deep/path")).toMatchSnapshot();
});

test("dynamic segments + splat return value", () => {
  let routes = [{ pattern: "/users/:userId/files/*" }];
  expect(
    pick(routes, "/users/ryan/files/some/deep/path")
  ).toMatchSnapshot();
});

test("query strings", () => {
  let routes = [{ pattern: "/users/:userId" }];
  expect(pick(routes, "/users/ryan?cool=stuff")).toMatchSnapshot();
});

test("resolve", () => {
  expect(resolve("/somewhere/else", "/users/123")).toEqual(
    "/somewhere/else"
  );
  expect(resolve("456", "/users/123")).toEqual("/users/456");
  expect(resolve("./", "/users/123")).toEqual("/users");
  expect(resolve(".", "/users/123")).toEqual("/users");
  expect(resolve("../", "/users/123")).toEqual("/");
  expect(resolve("..", "/users/123")).toEqual("/");
  expect(resolve("../.././3", "/u/1/g/4")).toEqual("/u/3");
  expect(resolve("../.././3?beef=boof", "/u/1/g/4")).toEqual(
    "/u/3?beef=boof"
  );
  expect(resolve("../.././3", "/u/1/g/4?beef=boof")).toEqual("/u/3");
  expect(resolve("stinky/barf", "/u/1/g/4")).toEqual(
    "/u/1/g/stinky/barf"
  );
  expect(resolve("?some=query", "/users/123?some=thing")).toEqual(
    "/users/123?some=query"
  );
  expect(resolve("/groups?some=query", "/users?some=thing")).toEqual(
    "/groups?some=query"
  );
});

const routes = shuffle([
  {
    value: "MainGroupMe",
    pattern: "/groups/main/users/me"
  },
  {
    value: "GroupMe",
    pattern: "/groups/:groupId/users/me"
  },
  {
    value: "GroupUser",
    pattern: "/groups/:groupId/users/:userId"
  },
  {
    value: "Fiver",
    pattern: "/:one/:two/:three/:four/:five"
  },
  {
    value: "GroupUsersSplat",
    pattern: "/groups/:groupId/users/*"
  },
  {
    value: "MainGroupUsers",
    pattern: "/groups/main/users"
  },
  {
    value: "GroupUsers",
    pattern: "/groups/:groupId/users"
  },
  {
    value: "MainGroup",
    pattern: "/groups/main"
  },
  {
    value: "Group",
    pattern: "/groups/:groupId"
  },
  {
    value: "Groups",
    pattern: "/groups"
  },
  {
    value: "FilesDeep",
    pattern: "/files/*"
  },
  {
    value: "Files",
    pattern: "/files"
  },
  {
    value: "Root",
    pattern: "/"
  },
  {
    value: "Default",
    default: true
  }
]);

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
