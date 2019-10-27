/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GiftCertificateDTO_Status } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: PendingShowing
// ====================================================

export interface PendingShowing_giftCertificates {
  __typename: "GiftCertificateDTO";
  expiresAt: any;
  number: string;
  status: GiftCertificateDTO_Status;
}

export interface PendingShowing {
  __typename: "UserDTO";
  giftCertificates: PendingShowing_giftCertificates[] | null;
}
