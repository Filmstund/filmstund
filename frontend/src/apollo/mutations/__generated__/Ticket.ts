/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: Ticket
// ====================================================

export interface Ticket_admin {
  __typename: "User";
  id: any;
}

export interface Ticket_ticketRange_seatings {
  __typename: "SeatRange";
  row: number;
  /**
   * All numbers for this particular row
   */
  numbers: number[] | null;
}

export interface Ticket_ticketRange {
  __typename: "TicketRange";
  rows: number[] | null;
  seatings: Ticket_ticketRange_seatings[] | null;
}

export interface Ticket_sfSeatMap_coordinates {
  __typename: "SfSeatCoordinates";
  x: number;
  y: number;
}

export interface Ticket_sfSeatMap_dimensions {
  __typename: "SfSeatDimensions";
  width: number;
  height: number;
}

export interface Ticket_sfSeatMap {
  __typename: "SfSeatMap";
  row: number;
  number: number;
  seatType: string;
  coordinates: Ticket_sfSeatMap_coordinates;
  dimensions: Ticket_sfSeatMap_dimensions;
}

export interface Ticket_myTickets_seat {
  __typename: "Seat";
  row: number;
  number: number;
}

export interface Ticket_myTickets {
  __typename: "Ticket";
  id: string;
  barcode: string;
  customerType: string;
  customerTypeDefinition: string;
  cinema: string;
  screen: string;
  profileId: string | null;
  seat: Ticket_myTickets_seat;
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

export interface Ticket {
  __typename: "Showing";
  id: any;
  webId: any;
  slug: string;
  admin: Ticket_admin;
  ticketRange: Ticket_ticketRange | null;
  sfSeatMap: Ticket_sfSeatMap[];
  myTickets: Ticket_myTickets[] | null;
}
