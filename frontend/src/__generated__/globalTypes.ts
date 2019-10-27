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
  userId: FilmstundUserID;
  showingId?: FilmstundShowingID | null;
  hasPaid: boolean;
  amountOwed: FilmstundSEK;
}

export interface CinemaScreenDTOInput {
  id: string;
  name?: string | null;
}

export interface CreateShowingDTOInput {
  date: FilmstundLocalDate;
  time: FilmstundLocalTime;
  movieId: FilmstundMovieID;
  location: string;
  filmstadenScreen?: CinemaScreenDTOInput | null;
  filmstadenRemoteEntityId?: string | null;
}

export interface GiftCertificateDTOInput {
  number: string;
  expiresAt?: FilmstundLocalDate | null;
}

/**
 * Used for supplying how the user will pay, when attending a showing
 */
export interface PaymentOption {
  type: PaymentType;
  ticketNumber?: string | null;
}

export interface UpdateShowingDTOInput {
  price: FilmstundSEK;
  payToUser: FilmstundUserID;
  location: string;
  filmstadenRemoteEntityId?: string | null;
  time: FilmstundLocalTime;
  date: FilmstundLocalDate;
}

export interface UserDetailsDTOInput {
  nick?: string | null;
  filmstadenMembershipId?: string | null;
  phone?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
