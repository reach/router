import { createHistory } from "./history";

describe("navigate", () => {
  test("navigate with number as a first argument", () => {
    const goMock = jest.fn();

    const mockSource = {
      history: {
        go: goMock
      }
    };
    const history = createHistory(mockSource);
    history.navigate(-1);
    expect(goMock).toHaveBeenCalledWith(-1);
  });
});
