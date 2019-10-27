/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum GiftCertificateDTO_Status {
  AVAILABLE = "AVAILABLE",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
  UNKNOWN = "UNKNOWN",
  USED = "USED",
}

export enum PaymentType {
  GIFT_CERTIFICATE = "GIFT_CERTIFICATE",
  SWISH = "SWISH",
}

export interface AttendeePaymentInfoDTOInput {
  userId: any;
  showingId?: any | null;
  hasPaid: boolean;
  amountOwed: any;
}

export interface CinemaScreenDTOInput {
  id: string;
  name?: string | null;
}

export interface CreateShowingDTOInput {
  date: any;
  time: any;
  movieId: any;
  location: string;
  filmstadenScreen?: CinemaScreenDTOInput | null;
  filmstadenRemoteEntityId?: string | null;
}

export interface GiftCertificateDTOInput {
  number: string;
  expiresAt?: any | null;
}

/**
 * Used for supplying how the user will pay, when attending a showing
 */
export interface PaymentOption {
  type: PaymentType;
  ticketNumber?: string | null;
}

export interface UpdateShowingDTOInput {
  price: any;
  payToUser: any;
  location: string;
  filmstadenRemoteEntityId?: string | null;
  time: any;
  date: any;
}

export interface UserDetailsDTOInput {
  nick?: string | null;
  filmstadenMembershipId?: string | null;
  phone?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
