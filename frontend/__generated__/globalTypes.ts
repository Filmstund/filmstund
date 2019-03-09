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
  date: any;
  time: any;
  movieId: any;
  location: string;
  sfScreen?: SfScreenInput | null;
  expectedBuyDate?: any | null;
}

export interface ForetagsbiljettInput {
  number: string;
  expires?: any | null;
}

export interface NewUserInfo {
  nick?: string | null;
  sfMembershipId?: string | null;
  phone?: string | null;
}

export interface ParticipantPaymentInput {
  id: any;
  userId: string;
  showingId?: any | null;
  hasPaid: boolean;
  amountOwed: any;
}

/**
 * Used for supplying how the use will pay, when attending a showing
 */
export interface PaymentOption {
  type: PaymentType;
  ticketNumber?: string | null;
}

export interface SfScreenInput {
  sfId: string;
  name?: string | null;
}

export interface UpdateShowingInput {
  price: any;
  private: boolean;
  payToUser: string;
  expectedBuyDate?: any | null;
  location: string;
  sfScreen?: SfScreenInput | null;
  time: any;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
