/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettStatus } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: UserProfile
// ====================================================

export interface UserProfile_me_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  number: string;
  expires: SeFilmLocalDate;
  status: ForetagsbiljettStatus;
}

export interface UserProfile_me {
  __typename: "CurrentUser";
  id: SeFilmUserID;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
  email: string;
  filmstadenMembershipId: string | null;
  phone: string | null;
  avatar: string | null;
  foretagsbiljetter: UserProfile_me_foretagsbiljetter[] | null;
  calendarFeedUrl: string | null;
}

export interface UserProfile {
  me: UserProfile_me;
}
