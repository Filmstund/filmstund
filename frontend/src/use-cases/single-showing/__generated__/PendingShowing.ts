/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettStatus } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: PendingShowing
// ====================================================

export interface PendingShowing_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  expires: any;
  number: string;
  status: ForetagsbiljettStatus;
}

export interface PendingShowing {
  __typename: "CurrentUser";
  foretagsbiljetter: PendingShowing_foretagsbiljetter[] | null;
}
