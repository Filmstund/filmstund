/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { AttendeePaymentInfoDTOInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: TogglePaidChange
// ====================================================

export interface TogglePaidChange_updateAttendeePaymentInfo {
  __typename: "AttendeeDTO";
  userId: any;
  hasPaid: boolean;
}

export interface TogglePaidChange {
  updateAttendeePaymentInfo: TogglePaidChange_updateAttendeePaymentInfo;
}

export interface TogglePaidChangeVariables {
  paymentInfo: AttendeePaymentInfoDTOInput;
}
