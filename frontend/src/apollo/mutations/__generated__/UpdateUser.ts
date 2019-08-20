/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { NewUserInfo, ForetagsbiljettStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateUser
// ====================================================

export interface UpdateUser_editedUser_foretagsbiljetter {
  __typename: "Foretagsbiljett";
  number: string;
  expires: any;
  status: ForetagsbiljettStatus;
}

export interface UpdateUser_editedUser {
  __typename: "CurrentUser";
  id: any;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
  email: string;
  filmstadenMembershipId: string | null;
  phone: string | null;
  avatar: string | null;
  foretagsbiljetter: UpdateUser_editedUser_foretagsbiljetter[] | null;
  calendarFeedUrl: string | null;
}

export interface UpdateUser {
  editedUser: UpdateUser_editedUser;
}

export interface UpdateUserVariables {
  user: NewUserInfo;
}
