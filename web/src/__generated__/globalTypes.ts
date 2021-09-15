/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ForetagsbiljettStatus {
  Available = "Available",
  Expired = "Expired",
  Pending = "Pending",
  Used = "Used",
}

export enum PaymentType {
  Foretagsbiljett = "Foretagsbiljett",
  Swish = "Swish",
}

export interface CreateShowingInput {
  date: SeFilmLocalDate;
  time: SeFilmLocalTime;
  movieId: SeFilmUUID;
  location: string;
  filmstadenScreen?: FilmstadenScreenInput | null;
  expectedBuyDate?: SeFilmLocalDate | null;
  filmstadenRemoteEntityId?: string | null;
}

export interface FilmstadenScreenInput {
  filmstadenId: string;
  name?: string | null;
}

export interface ForetagsbiljettInput {
  number: string;
  expires?: SeFilmLocalDate | null;
}

export interface NewUserInfo {
  nick?: string | null;
  filmstadenMembershipId?: string | null;
  phone?: string | null;
}

export interface ParticipantPaymentInput {
  id: SeFilmUUID;
  userId: string;
  showingId?: SeFilmUUID | null;
  hasPaid: boolean;
  amountOwed: SeFilmSEK;
}

/**
 * Used for supplying how the use will pay, when attending a showing
 */
export interface PaymentOption {
  type: PaymentType;
  ticketNumber?: string | null;
}

export interface UpdateShowingInput {
  price: SeFilmSEK;
  private: boolean;
  payToUser: string;
  expectedBuyDate?: SeFilmLocalDate | null;
  location: string;
  filmstadenRemoteEntityId?: string | null;
  time: SeFilmLocalTime;
  date: SeFilmLocalDate;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
