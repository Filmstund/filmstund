import { push } from "react-router-redux";
import { signoutUser, USER_SIGNOUT_ACTION } from "./user";

describe("userActions", () => {
  describe("signoutUser", () => {
    it("should call dispatch with USER_SIGNOUT_ACTION", () => {
      const dispatchMock = jest.fn();
      const getStateMock = jest.fn().mockReturnValue({
        router: {
          location: { pathname: "/showings", search: "" }
        }
      });
      signoutUser()(dispatchMock, getStateMock);

      expect(dispatchMock).toHaveBeenCalledWith({ type: USER_SIGNOUT_ACTION });
    });
    it("should push router with return url", () => {
      const dispatchMock = jest.fn();
      const getStateMock = jest.fn().mockReturnValue({
        router: {
          location: { pathname: "/showings", search: "?hello=hej" }
        }
      });
      signoutUser()(dispatchMock, getStateMock);

      expect(dispatchMock).toHaveBeenCalledWith(
        push(`/login?return_to=${encodeURIComponent("/showings?hello=hej")}`)
      );
    });
  });
});
