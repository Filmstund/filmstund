/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettStatus } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: AppQuery
// ====================================================

export interface AppQuery_me_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  number: string;
  expires: any;
  status: ForetagsbiljettStatus;
}

export interface AppQuery_me {
  __typename: "CurrentUser";
  id: any;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
  email: string;
  sfMembershipId: string | null;
  phone: string | null;
  avatar: string | null;
  foretagsbiljetter: AppQuery_me_foretagsbiljetter[] | null;
}

export interface AppQuery {
  me: AppQuery_me;
}