/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TicketQuery
// ====================================================

export interface TicketQuery_me {
  __typename: "UserDTO";
  id: FilmstundUserID;
}

export interface TicketQuery_showing_admin {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface TicketQuery_showing_ticketRange_seatings {
  __typename: "SeatRange";
  row: number;
  /**
   * All numbers for this particular row
   */
  numbers: number[];
}

export interface TicketQuery_showing_ticketRange {
  __typename: "TicketRange";
  rows: number[];
  seatings: TicketQuery_showing_ticketRange_seatings[];
}

export interface TicketQuery_showing_filmstadenSeatMap_coordinates {
  __typename: "FilmstadenSeatCoordinates";
  x: number;
  y: number;
}

export interface TicketQuery_showing_filmstadenSeatMap_dimensions {
  __typename: "FilmstadenSeatDimensions";
  width: number;
  height: number;
}

export interface TicketQuery_showing_filmstadenSeatMap {
  __typename: "FilmstadenSeatMapDTO";
  row: number;
  number: number;
  seatType: string;
  coordinates: TicketQuery_showing_filmstadenSeatMap_coordinates;
  dimensions: TicketQuery_showing_filmstadenSeatMap_dimensions;
}

export interface TicketQuery_showing_myTickets_seat {
  __typename: "Seat";
  number: number;
  row: number;
}

export interface TicketQuery_showing_myTickets {
  __typename: "TicketDTO";
  id: string;
  barcode: string;
  customerType: string;
  customerTypeDefinition: string;
  cinema: string;
  screen: string;
  profileId: string | null;
  seat: TicketQuery_showing_myTickets_seat;
  date: FilmstundLocalDate;
  time: string;
  movieName: string;
  /**
   * 15 år, 11 år etc.
   */
  movieRating: string;
  /**
   * "textad", "en" etc
   */
  attributes: string[];
}

export interface TicketQuery_showing {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  webId: FilmstundBase64ID;
  slug: string;
  admin: TicketQuery_showing_admin;
  ticketRange: TicketQuery_showing_ticketRange | null;
  filmstadenSeatMap: TicketQuery_showing_filmstadenSeatMap[];
  myTickets: TicketQuery_showing_myTickets[];
}

export interface TicketQuery {
  me: TicketQuery_me;
  showing: TicketQuery_showing | null;
}

export interface TicketQueryVariables {
  webId: FilmstundBase64ID;
}
