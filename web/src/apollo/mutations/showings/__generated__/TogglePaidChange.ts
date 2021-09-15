/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ParticipantPaymentInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: TogglePaidChange
// ====================================================

export interface TogglePaidChange_updateParticipantPaymentInfo {
  __typename: "ParticipantPaymentInfo";
  id: SeFilmUUID;
  hasPaid: boolean;
}

export interface TogglePaidChange {
  updateParticipantPaymentInfo: TogglePaidChange_updateParticipantPaymentInfo;
}

export interface TogglePaidChangeVariables {
  paymentInfo: ParticipantPaymentInput;
}
