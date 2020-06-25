import { pick, match, resolve, insertParams, shallowCompare } from "./utils";

describe("pick", () => {
  test("pick root or dynamic", () => {
    let routes = [
      { value: "root", path: "/" },
      { value: "dynamic", path: ":foo" }
    ];
    expect(pick(routes, "/").route.value).toBe("root");
  });

  test("a bunch of scenarios", () => {
    expect(pick(routes, "/").route.value).toBe("Root");
    expect(pick(routes, "/groups/main/users/me").route.value).toBe(
      "MainGroupMe"
    );
    expect(pick(routes, "/groups/123/users/456").route.value).toBe("GroupUser");
    expect(pick(routes, "/one/two/three/four/five").route.value).toBe("Fiver");
    expect(pick(routes, "/groups/main/users").route.value).toBe(
      "MainGroupUsers"
    );
    expect(pick(routes, "/groups/123/users").route.value).toBe("GroupUsers");
    expect(pick(routes, "/groups/main").route.value).toBe("MainGroup");
    expect(pick(routes, "/groups/123").route.value).toBe("Group");
    expect(pick(routes, "/groups").route.value).toBe("Groups");
    expect(pick(routes, "/files/some/long/path").route.value).toBe("FilesDeep");
    expect(pick(routes, "/files").route.value).toBe("Files");
    expect(pick(routes, "/no/where").route.value).toBe("Default");
  });

  test("pick /*", () => {
    expect(match("/*", "/whatever/else")).toMatchSnapshot();
  });

  test("pick return value", () => {
    expect(pick(routes, "/one/two/three/four/five")).toMatchSnapshot();
  });

  test("splat return value", () => {
    expect(pick(routes, "/files/some/deep/path")).toMatchSnapshot();
  });

  test("dynamic segments + splat return value", () => {
    let routes = [{ path: "/users/:userId/files/*" }];
    expect(pick(routes, "/users/ryan/files/some/deep/path")).toMatchSnapshot();
  });

  test("query strings", () => {
    let routes = [{ path: "/users/:userId" }];
    expect(pick(routes, "/users/ryan?cool=stuff")).toMatchSnapshot();
  });
});

describe("match", () => {
  test("works", () => {
    expect(match("/foo/:bar", "/foo/hello")).toMatchSnapshot();
  });
});

describe("resolve", () => {
  it("works with a / base", () => {
    expect(resolve("contacts/ryan", "/")).toEqual("/contacts/ryan");
  });

  test("a bunch of stuff", () => {
    expect(resolve("/somewhere/else", "/users/123")).toEqual("/somewhere/else");
    expect(resolve("settings", "/users/123")).toEqual("/users/123/settings");
    expect(resolve("../../one/../two/.././three", "/a/b/c/d/e/f/g")).toEqual(
      "/a/b/c/d/e/three"
    );
    expect(resolve("./", "/users/123")).toEqual("/users/123");
    expect(resolve(".", "/users/123")).toEqual("/users/123");
    expect(resolve("../", "/users/123")).toEqual("/users");
    expect(resolve("../..", "/users/123")).toEqual("/");
    expect(resolve("../.././3", "/u/1/g/4")).toEqual("/u/1/3");
    expect(resolve("../.././s?beef=boof", "/u/1/g/4")).toEqual(
      "/u/1/s?beef=boof"
    );
    expect(resolve("../.././3", "/u/1/g/4?beef=boof")).toEqual("/u/1/3");
    expect(resolve("stinky/barf", "/u/1/g/4")).toEqual("/u/1/g/4/stinky/barf");
    expect(resolve("?some=query", "/users/123?some=thing")).toEqual(
      "/users/123?some=query"
    );
    expect(resolve("/groups?some=query", "/users?some=thing")).toEqual(
      "/groups?some=query"
    );
  });
});

describe("insertParams", () => {
  it("works", () => {
    expect(
      insertParams("/users/:userId/groups/:groupId", {
        userId: "2",
        groupId: "4"
      })
    ).toEqual("/users/2/groups/4");
    expect(
      insertParams("/users/:userId/groups/:groupId", {
        userId: "2",
        groupId: "4",
        location: { search: "?a=b&b=c" }
      })
    ).toEqual("/users/2/groups/4?a=b&b=c");
  });
});

describe("shallowCompare", () => {
  test("objects are the same", () => {
    expect(shallowCompare({}, {})).toBeTruthy();
    expect(shallowCompare({ test: 1 }, { test: 1 })).toBeTruthy();
  });
  test("objects are different", () => {
    expect(shallowCompare({ a: undefined }, { b: undefined })).toBeFalsy();
    expect(shallowCompare({}, { b: undefined })).toBeFalsy();
    expect(shallowCompare({ test: 1 }, { test: 2 })).toBeFalsy();
  });
});

let routes = shuffle([
  {
    value: "MainGroupMe",
    path: "/groups/main/users/me"
  },
  {
    value: "GroupMe",
    path: "/groups/:groupId/users/me"
  },
  {
    value: "GroupUser",
    path: "/groups/:groupId/users/:userId"
  },
  {
    value: "Fiver",
    path: "/:one/:two/:three/:four/:five"
  },
  {
    value: "GroupUsersSplat",
    path: "/groups/:groupId/users/*"
  },
  {
    value: "MainGroupUsers",
    path: "/groups/main/users"
  },
  {
    value: "GroupUsers",
    path: "/groups/:groupId/users"
  },
  {
    value: "MainGroup",
    path: "/groups/main"
  },
  {
    value: "Group",
    path: "/groups/:groupId"
  },
  {
    value: "Groups",
    path: "/groups"
  },
  {
    value: "FilesDeep",
    path: "/files/*"
  },
  {
    value: "Files",
    path: "/files"
  },
  {
    value: "Root",
    path: "/"
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
