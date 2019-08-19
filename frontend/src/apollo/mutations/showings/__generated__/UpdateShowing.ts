/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UpdateShowingInput } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateShowing
// ====================================================

export interface UpdateShowing_updateShowing_payToUser {
  __typename: "User";
  id: any;
}

export interface UpdateShowing_updateShowing {
  __typename: "Showing";
  id: any;
  time: string;
  date: string;
  ticketsBought: boolean;
  price: any | null;
  private: boolean;
  payToUser: UpdateShowing_updateShowing_payToUser;
  expectedBuyDate: string | null;
}

export interface UpdateShowing {
  updateShowing: UpdateShowing_updateShowing;
}

export interface UpdateShowingVariables {
  showingId: any;
  showing: UpdateShowingInput;
}
