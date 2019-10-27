/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: Ticket
// ====================================================

export interface Ticket_admin {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface Ticket_ticketRange_seatings {
  __typename: "SeatRange";
  row: number;
  /**
   * All numbers for this particular row
   */
  numbers: number[];
}

export interface Ticket_ticketRange {
  __typename: "TicketRange";
  rows: number[];
  seatings: Ticket_ticketRange_seatings[];
}

export interface Ticket_filmstadenSeatMap_coordinates {
  __typename: "FilmstadenSeatCoordinates";
  x: number;
  y: number;
}

export interface Ticket_filmstadenSeatMap_dimensions {
  __typename: "FilmstadenSeatDimensions";
  width: number;
  height: number;
}

export interface Ticket_filmstadenSeatMap {
  __typename: "FilmstadenSeatMapDTO";
  row: number;
  number: number;
  seatType: string;
  coordinates: Ticket_filmstadenSeatMap_coordinates;
  dimensions: Ticket_filmstadenSeatMap_dimensions;
}

export interface Ticket_myTickets_seat {
  __typename: "Seat";
  number: number;
  row: number;
}

export interface Ticket_myTickets {
  __typename: "TicketDTO";
  id: string;
  barcode: string;
  customerType: string;
  customerTypeDefinition: string;
  cinema: string;
  screen: string;
  profileId: string | null;
  seat: Ticket_myTickets_seat;
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

export interface Ticket {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  webId: FilmstundBase64ID;
  slug: string;
  admin: Ticket_admin;
  ticketRange: Ticket_ticketRange | null;
  filmstadenSeatMap: Ticket_filmstadenSeatMap[];
  myTickets: Ticket_myTickets[];
}
