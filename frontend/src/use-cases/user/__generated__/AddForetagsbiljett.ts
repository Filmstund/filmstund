/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettInput, ForetagsbiljettStatus } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: AddForetagsbiljett
// ====================================================

export interface AddForetagsbiljett_addForetagsBiljetter_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  number: string;
  expires: any;
  status: ForetagsbiljettStatus;
}

export interface AddForetagsbiljett_addForetagsBiljetter {
  __typename: "CurrentUser";
  id: any;
  foretagsbiljetter: AddForetagsbiljett_addForetagsBiljetter_foretagsbiljetter[] | null;
}

export interface AddForetagsbiljett {
  addForetagsBiljetter: AddForetagsbiljett_addForetagsBiljetter;
}

export interface AddForetagsbiljettVariables {
  tickets?: ForetagsbiljettInput[] | null;
}
