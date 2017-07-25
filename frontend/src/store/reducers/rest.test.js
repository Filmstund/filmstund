import createCrudReducer from "./rest";

describe("createCrudReducer", () => {
  const movies = createCrudReducer("movies", "/movies");

  describe("crudReducer", () => {
    const moviesReducer = movies.reducer;
    const actions = movies._actions;
    const actionWithType = type => ({ type, data: { id: 10 }, error: "hello" });

    it("should have a default state", () => {
      expect(moviesReducer(undefined, { type: undefined })).toEqual({
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
        expect(moviesReducer(prevState, action)).toEqual(expectedState);
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
        expect(moviesReducer(prevState, action).loading).toBe(false);
        expect(moviesReducer(prevState, action).error).toBe(null);
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
        expect(moviesReducer(prevState, action).loading).toBe(false);
        expect(moviesReducer(prevState, action).error).toBe("hello");
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
        moviesReducer(prevState, { type: actions.successCreate, data })
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
        moviesReducer(prevState, { type: actions.successUpdate, data })
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
        moviesReducer(prevState, { type: actions.successDelete, id })
      ).toEqual(expectedDeleteState);
    });
  });
});
