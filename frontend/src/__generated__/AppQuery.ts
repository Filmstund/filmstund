/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GiftCertificateDTO_Status } from "./globalTypes";

// ====================================================
// GraphQL query operation: AppQuery
// ====================================================

export interface AppQuery_me_giftCertificates {
  __typename: "GiftCertificateDTO";
  number: string;
  expiresAt: FilmstundLocalDate;
  status: GiftCertificateDTO_Status;
}

export interface AppQuery_me {
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
  giftCertificates: AppQuery_me_giftCertificates[];
}

export interface AppQuery {
  me: AppQuery_me;
}
