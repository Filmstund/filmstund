/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: AttendeeList
// ====================================================

export interface AttendeeList_userInfo {
  __typename: "PublicUserDTO";
  avatar: string | null;
  firstName: string | null;
  nick: string | null;
  lastName: string | null;
  phone: string | null;
  id: any;
}

export interface AttendeeList {
  __typename: "PublicAttendeeDTO";
  userInfo: AttendeeList_userInfo;
}
