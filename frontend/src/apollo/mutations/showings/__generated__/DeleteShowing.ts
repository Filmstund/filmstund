/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteShowing
// ====================================================

export interface DeleteShowing_deleteShowing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
}

export interface DeleteShowing {
  /**
   * Delete a showign and return all public showings
   */
  deleteShowing: DeleteShowing_deleteShowing[] | null;
}

export interface DeleteShowingVariables {
  showingId: FilmstundShowingID;
}
