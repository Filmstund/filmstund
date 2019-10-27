/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddTickets
// ====================================================

export interface AddTickets_processTicketUrls_admin {
  __typename: "PublicUserDTO";
  id: any;
}

export interface AddTickets_processTicketUrls_ticketRange_seatings {
  __typename: "SeatRange";
  row: number;
  /**
   * All numbers for this particular row
   */
  numbers: number[] | null;
}

export interface AddTickets_processTicketUrls_ticketRange {
  __typename: "TicketRange";
  rows: number[] | null;
  seatings: AddTickets_processTicketUrls_ticketRange_seatings[] | null;
}

export interface AddTickets_processTicketUrls_filmstadenSeatMap_coordinates {
  __typename: "FilmstadenSeatCoordinates";
  x: number;
  y: number;
}

export interface AddTickets_processTicketUrls_filmstadenSeatMap_dimensions {
  __typename: "FilmstadenSeatDimensions";
  width: number;
  height: number;
}

export interface AddTickets_processTicketUrls_filmstadenSeatMap {
  __typename: "FilmstadenSeatMapDTO";
  row: number;
  number: number;
  seatType: string;
  coordinates: AddTickets_processTicketUrls_filmstadenSeatMap_coordinates;
  dimensions: AddTickets_processTicketUrls_filmstadenSeatMap_dimensions;
}

export interface AddTickets_processTicketUrls_myTickets {
  __typename: "TicketDTO";
  id: string;
  barcode: string;
  customerType: string;
  customerTypeDefinition: string;
  cinema: string;
  screen: string;
  profileId: string | null;
  seatNumber: number;
  seatRow: number;
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
  attributes: string[] | null;
}

export interface AddTickets_processTicketUrls {
  __typename: "ShowingDTO";
  id: any;
  webId: any;
  slug: string;
  admin: AddTickets_processTicketUrls_admin;
  ticketRange: AddTickets_processTicketUrls_ticketRange | null;
  filmstadenSeatMap: AddTickets_processTicketUrls_filmstadenSeatMap[];
  myTickets: AddTickets_processTicketUrls_myTickets[] | null;
}

export interface AddTickets {
  processTicketUrls: AddTickets_processTicketUrls;
}

export interface AddTicketsVariables {
  showingId: any;
  tickets?: string[] | null;
}
