/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { UserDetailsDTOInput, GiftCertificateDTO_Status } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateUser
// ====================================================

export interface UpdateUser_editedUser_giftCertificates {
  __typename: "GiftCertificateDTO";
  number: string;
  expiresAt: FilmstundLocalDate;
  status: GiftCertificateDTO_Status;
}

export interface UpdateUser_editedUser {
  __typename: "UserDTO";
  id: FilmstundUserID;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
  email: string;
  filmstadenMembershipId: string | null;
  phone: string | null;
  avatar: string | null;
  giftCertificates: UpdateUser_editedUser_giftCertificates[] | null;
  calendarFeedUrl: string | null;
}

export interface UpdateUser {
  editedUser: UpdateUser_editedUser;
}

export interface UpdateUserVariables {
  user: UserDetailsDTOInput;
}
