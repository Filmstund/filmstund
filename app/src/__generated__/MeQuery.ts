/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: MeQuery
// ====================================================

export interface MeQuery_currentUser_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  expires: SeFilmLocalDate;
  number: string;
  status: ForetagsbiljettStatus;
}

export interface MeQuery_currentUser {
  __typename: "CurrentUser";
  id: SeFilmUserID;
  avatar: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
  phone: string | null;
  filmstadenMembershipId: string | null;
  calendarFeedUrl: string | null;
  foretagsbiljetter: MeQuery_currentUser_foretagsbiljetter[] | null;
}

export interface MeQuery {
  currentUser: MeQuery_currentUser;
}
