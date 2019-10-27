/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GiftCertificateDTO_Status } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: CompleteUser
// ====================================================

export interface CompleteUser_giftCertificates {
  __typename: "GiftCertificateDTO";
  number: string;
  expiresAt: any;
  status: GiftCertificateDTO_Status;
}

export interface CompleteUser {
  __typename: "UserDTO";
  id: any;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nick: string | null;
  email: string;
  filmstadenMembershipId: string | null;
  phone: string | null;
  avatar: string | null;
  giftCertificates: CompleteUser_giftCertificates[] | null;
}
