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
  console.log(testHistory);
  testHistory.navigate("/?asdf");
  expect(testHistory.location.search).toEqual("?asdf");
});
