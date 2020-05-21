import { createMemorySource, createHistory } from "./history";

describe("createMemorySource", () => {
  it("creates a memory source with correct pathname", () => {
    const testHistory = createMemorySource("/test");
    expect(testHistory.location.pathname).toBe("/test");
  });

  it("creates a memory source with search", () => {
    const testHistory = createMemorySource("/test?foo=bar");
    expect(testHistory.location.search).toBe("?foo=bar");
  });
});

describe("createHistory", () => {
  it("should have location with pathname", () => {
    const mockSource = {
      history: {},
      location: {
        pathname: "/page",
        search: "",
        hash: ""
      }
    };

    const history = createHistory(mockSource);

    expect(history.location.pathname).toEqual("/page");
  });

  it("should encode location pathname", () => {
    const mockSource = {
      history: {},
      location: {
        pathname: "/påge",
        search: "",
        hash: ""
      }
    };

    const history = createHistory(mockSource);

    expect(history.location.pathname).toEqual("/p%C3%A5ge");
  });

  it("should not encode location pathname if it is already encoded", () => {
    const mockSource = {
      history: {},
      location: {
        pathname: "/p%C3%A5ge",
        search: "",
        hash: ""
      }
    };

    const history = createHistory(mockSource);

    expect(history.location.pathname).toEqual("/p%C3%A5ge");
  });
  
  it("should not encode location pathname if it is already encoded", () => {
    const mockSource = {
      history: {},
      location: {
        pathname: "/%2F",
        search: "",
        hash: ""
      }
    };

    const history = createHistory(mockSource);

    expect(history.location.pathname).toEqual("/%2F");
  });
  
});

describe("navigate", () => {
  test("should go to url", () => {
    const mockSource = createMemorySource("/one");
    const history = createHistory(mockSource);
    history.navigate("/two");
    expect(history.location.pathname).toBe("/two");
  });

  test("should go to previous route", () => {
    const mockSource = createMemorySource("/one");
    const history = createHistory(mockSource);
    history.navigate("/two");
    history.navigate(-1);
    expect(history.location.pathname).toBe("/one");
  });

  test("should go to next route", () => {
    const mockSource = createMemorySource("/one");
    const history = createHistory(mockSource);
    history.navigate("/two");
    history.navigate(-1);
    history.navigate(1);
    expect(history.location.pathname).toBe("/two");
  });
});

it("should have a proper search", () => {
  const testHistory = createHistory(createMemorySource("/test"));
  testHistory.navigate("/?asdf");
  expect(testHistory.location.search).toEqual("?asdf");
});

describe("Location pathname is undefined. Old device.", () => {
  it("Should works fine", () => {
    const mockSource = {
      history: {
        go: jest.fn()
      },
      location: {
        pathname: undefined,
        search: "",
        hash: "",
        href: "http://localhost/test"
      }
    };

    const history = createHistory(mockSource);
    expect(history.location.pathname).toBe("/test");
  });
});
