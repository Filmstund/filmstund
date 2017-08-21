import showings from "./showings";
const showingsReducer = showings.reducer;
const actions = showings._actions;

describe("showingsReducer", () => {
  const actionWithType = type => ({ type, data: { id: 10 }, error: "hello" });

  it("should have a default state", () => {
    expect(showingsReducer(undefined, { type: undefined })).toEqual({
      loading: {},
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
      loading: { index: false },
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
    const id = 10;
    const prevState = {
      data: {},
      loading: { [id]: false },
      error: "hello error"
    };
    const expectedState = {
      loading: { [id]: true },
      error: null,
      data: {}
    };
    const actionWithType = type => ({ type, id });

    const requestActions = [
      actions.requestSingle,
      actions.requestCreate,
      actions.requestDelete,
      actions.requestUpdate,
      actions.requestAttend,
      actions.requestUnattend
    ].map(actionWithType);

    requestActions.forEach(action => {
      expect(showingsReducer(prevState, action)).toEqual(expectedState);
    });
  });
  it("should set loading on index request", () => {
    const prevState = {
      data: {},
      loading: { index: false },
      error: "hello error"
    };
    const expectedState = {
      loading: { index: true },
      error: null,
      data: {}
    };
    const actionWithType = type => ({ type });

    expect(
      showingsReducer(prevState, actionWithType(actions.requestIndex))
    ).toEqual(expectedState);
  });
  it("should unset loading on success", () => {
    const id = "6";
    const prevState = { loading: { [id]: true }, error: "hello error" };

    const actionWithType = type => ({ type, id, data: { id } });

    const successActions = [
      actions.successCreate,
      actions.successUpdate,
      actions.successAttend,
      actions.successUnattend
    ].map(actionWithType);

    successActions.forEach(action => {
      expect(showingsReducer(prevState, action).loading[id]).toBe(false);
    });
  });
  it("should unset error on success", () => {
    const id = "6";
    const prevState = { loading: { [id]: true }, error: "hello error" };

    const actionWithType = type => ({ type, id, data: { id } });

    const successActions = [
      actions.successCreate,
      actions.successUpdate,
      actions.successAttend,
      actions.successUnattend
    ].map(actionWithType);

    successActions.forEach(action => {
      expect(showingsReducer(prevState, action).error).toBe(null);
    });
  });
  it("should set error on error", () => {
    const prevState = { loading: { 10: true }, error: null };

    const errorActions = [
      actions.errorCreate,
      actions.errorIndex,
      actions.errorDelete,
      actions.errorUpdate
    ].map(actionWithType);

    errorActions.forEach(action => {
      expect(showingsReducer(prevState, action).error).toBe("hello");
    });
  });
  it("should add with id on success create", () => {
    const data = {
      id: 10,
      hello: "data"
    };
    const prevState = {
      loading: {},
      error: null,
      data: {
        5: { id: 5, hello: "object" },
        6: { id: 6, hello: "my man" }
      }
    };

    const expectedCreateState = {
      5: { id: 5, hello: "object" },
      6: { id: 6, hello: "my man" },
      10: data
    };

    expect(
      showingsReducer(prevState, { type: actions.successCreate, data }).data
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
      5: data,
      6: { id: 6, hello: "my man" }
    };

    expect(
      showingsReducer(prevState, { type: actions.successUpdate, data }).data
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
      5: { id: 5, participants: participants },
      6: { id: 6, hello: "my man" }
    };

    expect(
      showingsReducer(prevState, {
        type: actions.successAttend,
        id: 5,
        participants
      }).data
    ).toEqual(expectedUpdateState);

    expect(
      showingsReducer(prevState, {
        type: actions.successUnattend,
        id: 5,
        participants
      }).data
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
      5: { id: 5, hello: "object" }
    };

    expect(
      showingsReducer(prevState, { type: actions.successDelete, id }).data
    ).toEqual(expectedDeleteState);
  });
});
