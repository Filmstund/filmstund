import { requestAndValidate } from "./helper";

describe("reducerHelper", () => {
  describe("requestAndValidate", () => {
    it("should call fetch-like object with all args", () => {
      const dispatchMock = jest.fn();
      const fetchMock = jest.fn().mockReturnValue(Promise.resolve());
      const args = ["this", "is", "a", "list", "of", "arguments"];

      requestAndValidate(dispatchMock, fetchMock, ...args);
      expect(fetchMock).toHaveBeenCalledWith(...args);
    });

    it("should just forward rejected promise when status not 403", () => {
      const dispatchMock = jest.fn();
      const error = { msg: "It failed" };
      const fetchMock = jest.fn().mockReturnValue(Promise.reject(error));

      expect(requestAndValidate(dispatchMock, fetchMock)).rejects.toBe(error);
      expect(dispatchMock).not.toHaveBeenCalled();
    });

    it("should call dispatch if status is 403", async () => {
      const dispatchMock = jest.fn();
      const error = { msg: "It failed", status: 403 };
      const fetchMock = jest.fn().mockReturnValue(Promise.reject(error));

      await expect(requestAndValidate(dispatchMock, fetchMock)).rejects.toBe(
        error
      );
      expect(dispatchMock).toHaveBeenCalled();
    });
  });
});
