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
  console.log(testHistory);
  testHistory.navigate("/?asdf");
  expect(testHistory.location.search).toEqual("?asdf");
});
