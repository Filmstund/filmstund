/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdateShowingDTOInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateShowing
// ====================================================

export interface UpdateShowing_updateShowing_payToUser {
  __typename: "PublicUserDTO";
  id: any;
}

export interface UpdateShowing_updateShowing {
  __typename: "ShowingDTO";
  id: any;
  time: string;
  date: string;
  ticketsBought: boolean;
  price: any | null;
  payToUser: UpdateShowing_updateShowing_payToUser;
}

export interface UpdateShowing {
  updateShowing: UpdateShowing_updateShowing;
}

export interface UpdateShowingVariables {
  showingId: any;
  showing: UpdateShowingDTOInput;
}
