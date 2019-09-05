import { createHistory, createMemorySource } from "./history";

describe("createHistory", () => {
  test("should use default getLocation if not passed in through options", () => {
    let history = createHistory(createMemorySource());
    expect(history.location).toHaveProperty("pathname", "/");
  });

  test("should use custom getLocation", () => {
    let options = {
      getLocation(source) {
        const params = new URLSearchParams(source.location.search);

        return {
          ...source.location,
          query: params,
          state: window.history.state,
          key: (window.history.state && window.history.state.key) || "initial"
        };
      }
    };
    let history = createHistory(createMemorySource("/"), options);
    history.navigate("?yo=dawg");

    expect(history.location.query).toBeInstanceOf(URLSearchParams);
    expect(history.location.query.get("yo")).toEqual("dawg");
  });
});
