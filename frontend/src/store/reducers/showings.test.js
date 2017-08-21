import showings from "./showings";
const showingsReducer = showings.reducer;
const actions = showings._actions;

describe("showingsReducer", () => {
  const actionWithType = type => ({ type, data: { id: 10 }, error: "hello" });

  it("should have a default state", () => {
    expect(showingsReducer(undefined, { type: undefined })).toEqual({
      loading: false,
      data: {},
      error: null
    });
  });

  it("should replace whole data object on success index", () => {
    const data = {
      hashj: {
        id: 111,
        name: "hello"
      },
      asasa: {
        id: 12121,
        name: "goodbye"
      }
    };
    const expectedState = {
      loading: false,
      data: data,
      error: null
    };
    const beforeData = {
      hello: "goodbye"
    };

    expect(
      showingsReducer(
        { data: beforeData },
        {
          type: actions.successIndex,
          data
        }
      )
    ).toEqual(expectedState);
  });
  it("should set loading on request", () => {
    const prevState = { loading: false, error: "hello error" };
    const expectedState = {
      loading: true,
      error: null
    };
    const actionWithType = type => ({ type });

    const requestActions = [
      actions.requestCreate,
      actions.requestIndex,
      actions.requestDelete,
      actions.requestUpdate
    ].map(actionWithType);

    requestActions.forEach(action => {
      expect(showingsReducer(prevState, action)).toEqual(expectedState);
    });
  });
  it("should unset loading on success", () => {
    const prevState = { loading: true, error: "hello error" };

    const successActions = [
      actions.successCreate,
      actions.successIndex,
      actions.successDelete,
      actions.successUpdate
    ].map(actionWithType);

    successActions.forEach(action => {
      expect(showingsReducer(prevState, action).loading).toBe(false);
      expect(showingsReducer(prevState, action).error).toBe(null);
    });
  });
  it("should set error on error", () => {
    const prevState = { loading: true, error: null };

    const errorActions = [
      actions.errorCreate,
      actions.errorIndex,
      actions.errorDelete,
      actions.errorUpdate
    ].map(actionWithType);

    errorActions.forEach(action => {
      expect(showingsReducer(prevState, action).loading).toBe(false);
      expect(showingsReducer(prevState, action).error).toBe("hello");
    });
  });
  it("should add with id on success create", () => {
    const data = {
      id: 10,
      hello: "data"
    };
    const prevState = {
      loading: true,
      error: null,
      data: {
        5: { id: 5, hello: "object" },
        6: { id: 6, hello: "my man" }
      }
    };

    const expectedCreateState = {
      loading: false,
      error: null,
      data: {
        5: { id: 5, hello: "object" },
        6: { id: 6, hello: "my man" },
        10: data
      }
    };

    expect(
      showingsReducer(prevState, { type: actions.successCreate, data })
    ).toEqual(expectedCreateState);
  });

  it("should merge with id on success update", () => {
    const data = {
      id: 5,
      hello: "data"
    };
    const prevState = {
      loading: true,
      error: null,
      data: {
        5: { id: 5, hello: "object" },
        6: { id: 6, hello: "my man" }
      }
    };

    const expectedUpdateState = {
      loading: false,
      error: null,
      data: {
        5: data,
        6: { id: 6, hello: "my man" }
      }
    };

    expect(
      showingsReducer(prevState, { type: actions.successUpdate, data })
    ).toEqual(expectedUpdateState);
  });

  it("should add new participants on requestAttend/requestUnattend", () => {
    const participants = ["19234861", "12453533", "87656789"];
    const prevState = {
      loading: true,
      error: null,
      data: {
        5: { id: 5, participants: ["11123422"] },
        6: { id: 6, hello: "my man" }
      }
    };

    const expectedUpdateState = {
      loading: false,
      error: null,
      data: {
        5: { id: 5, participants: participants },
        6: { id: 6, hello: "my man" }
      }
    };

    expect(
      showingsReducer(prevState, {
        type: actions.successAttend,
        id: 5,
        participants
      })
    ).toEqual(expectedUpdateState);

    expect(
      showingsReducer(prevState, {
        type: actions.successUnattend,
        id: 5,
        participants
      })
    ).toEqual(expectedUpdateState);
  });
  it("should remove with id on success delete", () => {
    const id = 6;
    const prevState = {
      loading: true,
      error: null,
      data: {
        5: { id: 5, hello: "object" },
        6: { id: 6, hello: "my man" }
      }
    };

    const expectedDeleteState = {
      loading: false,
      error: null,
      data: {
        5: { id: 5, hello: "object" }
      }
    };

    expect(
      showingsReducer(prevState, { type: actions.successDelete, id })
    ).toEqual(expectedDeleteState);
  });
});
