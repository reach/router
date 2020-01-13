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
});

describe("navigate", () => {
  test("navigate with number as a first argument", () => {
    const goMock = jest.fn();

    const mockSource = {
      history: {
        go: goMock
      },
      location: {
        pathname: "",
        search: "",
        hash: ""
      }
    };
    const history = createHistory(mockSource);
    history.navigate(-1);
    expect(goMock).toHaveBeenCalledWith(-1);
  });
});

it("should have a proper search", () => {
  const testHistory = createHistory(createMemorySource("/test"));
  testHistory.navigate("/?asdf");
  expect(testHistory.location.search).toEqual("?asdf");
});
