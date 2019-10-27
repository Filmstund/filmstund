/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GiftCertificateDTO_Status } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: UserProfile
// ====================================================

export interface UserProfile_me_giftCertificates {
  __typename: "GiftCertificateDTO";
  number: string;
  expiresAt: FilmstundLocalDate;
  status: GiftCertificateDTO_Status;
}

export interface UserProfile_me {
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
  giftCertificates: UserProfile_me_giftCertificates[] | null;
  calendarFeedUrl: string | null;
}

export interface UserProfile {
  me: UserProfile_me;
}
