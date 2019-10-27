/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdateShowingDTOInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateShowing
// ====================================================

export interface UpdateShowing_updateShowing_payToUser {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface UpdateShowing_updateShowing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  time: string;
  date: string;
  ticketsBought: boolean;
  price: FilmstundSEK | null;
  payToUser: UpdateShowing_updateShowing_payToUser;
}

export interface UpdateShowing {
  updateShowing: UpdateShowing_updateShowing;
}

export interface UpdateShowingVariables {
  showingId: FilmstundShowingID;
  showing: UpdateShowingDTOInput;
}
