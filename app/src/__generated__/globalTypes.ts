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

/**
 * Used for supplying how the use will pay, when attending a showing
 */
export interface PaymentOption {
  type: PaymentType;
  ticketNumber?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
