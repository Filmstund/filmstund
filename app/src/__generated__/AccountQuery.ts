/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: AccountQuery
// ====================================================

export interface AccountQuery_currentUser_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  expires: SeFilmLocalDate;
  number: string;
  status: ForetagsbiljettStatus;
}

export interface AccountQuery_currentUser {
  __typename: "CurrentUser";
  avatar: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
  phone: string | null;
  filmstadenMembershipId: string | null;
  calendarFeedUrl: string | null;
  foretagsbiljetter: AccountQuery_currentUser_foretagsbiljetter[] | null;
}

export interface AccountQuery {
  currentUser: AccountQuery_currentUser;
}
