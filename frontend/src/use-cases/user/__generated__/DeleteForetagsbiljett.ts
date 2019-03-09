/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettInput, ForetagsbiljettStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteForetagsbiljett
// ====================================================

export interface DeleteForetagsbiljett_deleteForetagsBiljett_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  number: string;
  expires: any;
  status: ForetagsbiljettStatus;
}

export interface DeleteForetagsbiljett_deleteForetagsBiljett {
  __typename: "CurrentUser";
  id: any;
  foretagsbiljetter: DeleteForetagsbiljett_deleteForetagsBiljett_foretagsbiljetter[] | null;
}

export interface DeleteForetagsbiljett {
  deleteForetagsBiljett: DeleteForetagsbiljett_deleteForetagsBiljett;
}

export interface DeleteForetagsbiljettVariables {
  ticket: ForetagsbiljettInput;
}
