/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowingAdmin
// ====================================================

export interface ShowingAdmin_filmstadenScreen {
  __typename: "FilmstadenScreen";
  filmstadenId: string;
  name: string;
}

export interface ShowingAdmin_payToUser {
  __typename: "User";
  id: any;
}

export interface ShowingAdmin_adminPaymentDetails_filmstadenData_user {
  __typename: "User";
  id: any;
  nick: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface ShowingAdmin_adminPaymentDetails_filmstadenData {
  __typename: "FilmstadenData";
  user: ShowingAdmin_adminPaymentDetails_filmstadenData_user;
  filmstadenMembershipId: string | null;
  foretagsbiljett: string | null;
}

export interface ShowingAdmin_adminPaymentDetails_participantPaymentInfos_user {
  __typename: "User";
  id: any;
  nick: string | null;
  name: string | null;
  phone: string | null;
}

export interface ShowingAdmin_adminPaymentDetails_participantPaymentInfos {
  __typename: "ParticipantPaymentInfo";
  id: any;
  hasPaid: boolean;
  amountOwed: any;
  user: ShowingAdmin_adminPaymentDetails_participantPaymentInfos_user;
}

export interface ShowingAdmin_adminPaymentDetails {
  __typename: "AdminPaymentDetails";
  filmstadenBuyLink: string | null;
  filmstadenData: ShowingAdmin_adminPaymentDetails_filmstadenData[];
  participantPaymentInfos: ShowingAdmin_adminPaymentDetails_participantPaymentInfos[];
}

export interface ShowingAdmin {
  __typename: "Showing";
  id: any;
  price: any | null;
  private: boolean;
  filmstadenRemoteEntityId: string | null;
  filmstadenScreen: ShowingAdmin_filmstadenScreen | null;
  payToUser: ShowingAdmin_payToUser;
  adminPaymentDetails: ShowingAdmin_adminPaymentDetails | null;
}
