import createCrudReducer from "./rest";

describe("createCrudReducer", () => {
  const movies = createCrudReducer("movies", "/movies");

  describe("crudReducer", () => {
    const moviesReducer = movies.reducer;
    const actions = movies._actions;
    const actionWithType = type => ({ type, data: { id: 10 }, error: "hello" });

    it("should have a default state", () => {
      expect(moviesReducer(undefined, { type: undefined })).toEqual({
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
        moviesReducer(
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
      const prevState = { loading: {}, error: "hello error", data: {} };
      const expectedState = {
        loading: { [id]: true },
        error: null,
        data: {}
      };
      const actionWithType = type => ({ type, id });

      const requestActions = [
        actions.requestCreate,
        actions.requestDelete,
        actions.requestUpdate
      ].map(actionWithType);

      requestActions.forEach(action => {
        expect(moviesReducer(prevState, action)).toEqual(expectedState);
      });
    });
    it("should unset loading on success", () => {
      const id = 11;
      const prevState = {
        loading: { [id]: true },
        error: "hello error",
        data: {}
      };

      const actionWithType = type => ({ type, id, data: { id } });

      const successActions = [actions.successCreate, actions.successUpdate].map(
        actionWithType
      );

      successActions.forEach(action => {
        expect(moviesReducer(prevState, action).loading[id]).toBe(false);
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
        expect(moviesReducer(prevState, action).error).toBe("hello");
      });
    });
    it("should add with id on success create", () => {
      const data = {
        id: 10,
        hello: "data"
      };
      const prevState = {
        loading: { 10: true },
        error: null,
        data: {
          5: { id: 5, hello: "object" },
          6: { id: 6, hello: "my man" }
        }
      };

      const expectedCreateState = {
        loading: { 10: false },
        error: null,
        data: {
          5: { id: 5, hello: "object" },
          6: { id: 6, hello: "my man" },
          10: data
        }
      };

      expect(
        moviesReducer(prevState, { type: actions.successCreate, id: 10, data })
      ).toEqual(expectedCreateState);
    });

    it("should merge with id on success update", () => {
      const data = {
        id: 5,
        hello: "data"
      };
      const prevState = {
        loading: { 5: true },
        error: null,
        data: {
          5: { id: 5, hello: "object" },
          6: { id: 6, hello: "my man" }
        }
      };

      const expectedUpdateState = {
        loading: { 5: false },
        error: null,
        data: {
          5: data,
          6: { id: 6, hello: "my man" }
        }
      };

      expect(
        moviesReducer(prevState, { type: actions.successUpdate, id: 5, data })
      ).toEqual(expectedUpdateState);
    });
    it("should remove with id on success delete", () => {
      const id = 6;
      const prevState = {
        loading: { [id]: true },
        error: null,
        data: {
          5: { id: 5, hello: "object" },
          6: { id: 6, hello: "my man" }
        }
      };

      const expectedDeleteState = {
        loading: {},
        error: null,
        data: {
          5: { id: 5, hello: "object" }
        }
      };

      expect(
        moviesReducer(prevState, { type: actions.successDelete, id })
      ).toEqual(expectedDeleteState);
    });
  });
});
