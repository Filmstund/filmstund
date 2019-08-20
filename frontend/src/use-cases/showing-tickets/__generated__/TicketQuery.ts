/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TicketQuery
// ====================================================

export interface TicketQuery_me {
  __typename: "CurrentUser";
  id: any;
}

export interface TicketQuery_showing_admin {
  __typename: "User";
  id: any;
}

export interface TicketQuery_showing_ticketRange_seatings {
  __typename: "SeatRange";
  row: number;
  /**
   * All numbers for this particular row
   */
  numbers: number[] | null;
}

export interface TicketQuery_showing_ticketRange {
  __typename: "TicketRange";
  rows: number[] | null;
  seatings: TicketQuery_showing_ticketRange_seatings[] | null;
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
  __typename: "FilmstadenSeatMap";
  row: number;
  number: number;
  seatType: string;
  coordinates: TicketQuery_showing_filmstadenSeatMap_coordinates;
  dimensions: TicketQuery_showing_filmstadenSeatMap_dimensions;
}

export interface TicketQuery_showing_myTickets_seat {
  __typename: "Seat";
  row: number;
  number: number;
}

export interface TicketQuery_showing_myTickets {
  __typename: "Ticket";
  id: string;
  barcode: string;
  customerType: string;
  customerTypeDefinition: string;
  cinema: string;
  screen: string;
  profileId: string | null;
  seat: TicketQuery_showing_myTickets_seat;
  date: any;
  time: string;
  movieName: string;
  /**
   * 15 år, 11 år etc.
   */
  movieRating: string;
  /**
   * "textad", "en" etc
   */
  showAttributes: string[] | null;
}

export interface TicketQuery_showing {
  __typename: "Showing";
  id: any;
  webId: any;
  slug: string;
  admin: TicketQuery_showing_admin;
  ticketRange: TicketQuery_showing_ticketRange | null;
  filmstadenSeatMap: TicketQuery_showing_filmstadenSeatMap[];
  myTickets: TicketQuery_showing_myTickets[] | null;
}

export interface TicketQuery {
  me: TicketQuery_me;
  showing: TicketQuery_showing | null;
}

export interface TicketQueryVariables {
  webId: any;
}
