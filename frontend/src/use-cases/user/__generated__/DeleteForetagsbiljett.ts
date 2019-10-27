/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { GiftCertificateDTOInput, GiftCertificateDTO_Status } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteForetagsbiljett
// ====================================================

export interface DeleteForetagsbiljett_deleteGiftCertificate_giftCertificates {
  __typename: "GiftCertificateDTO";
  number: string;
  expiresAt: FilmstundLocalDate;
  status: GiftCertificateDTO_Status;
}

export interface DeleteForetagsbiljett_deleteGiftCertificate {
  __typename: "UserDTO";
  id: FilmstundUserID;
  giftCertificates: DeleteForetagsbiljett_deleteGiftCertificate_giftCertificates[] | null;
}

export interface DeleteForetagsbiljett {
  deleteGiftCertificate: DeleteForetagsbiljett_deleteGiftCertificate;
}

export interface DeleteForetagsbiljettVariables {
  ticket: GiftCertificateDTOInput;
}
