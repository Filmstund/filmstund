/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ForetagsbiljettStatus } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: CompleteUser
// ====================================================

export interface CompleteUser_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  number: string;
  expires: SeFilmLocalDate;
  status: ForetagsbiljettStatus;
}

export interface CompleteUser {
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
  foretagsbiljetter: CompleteUser_foretagsbiljetter[] | null;
}
