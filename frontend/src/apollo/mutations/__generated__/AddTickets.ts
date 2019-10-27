/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddTickets
// ====================================================

export interface AddTickets_processTicketUrls_admin {
  __typename: "PublicUserDTO";
  id: FilmstundUserID;
}

export interface AddTickets_processTicketUrls_ticketRange_seatings {
  __typename: "SeatRange";
  row: number;
  /**
   * All numbers for this particular row
   */
  numbers: number[];
}

export interface AddTickets_processTicketUrls_ticketRange {
  __typename: "TicketRange";
  rows: number[];
  seatings: AddTickets_processTicketUrls_ticketRange_seatings[];
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

export interface AddTickets_processTicketUrls_myTickets_seat {
  __typename: "Seat";
  number: number;
  row: number;
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
  seat: AddTickets_processTicketUrls_myTickets_seat;
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

export interface AddTickets_processTicketUrls {
  __typename: "ShowingDTO";
  id: FilmstundShowingID;
  webId: FilmstundBase64ID;
  slug: string;
  admin: AddTickets_processTicketUrls_admin;
  ticketRange: AddTickets_processTicketUrls_ticketRange | null;
  filmstadenSeatMap: AddTickets_processTicketUrls_filmstadenSeatMap[];
  myTickets: AddTickets_processTicketUrls_myTickets[];
}

export interface AddTickets {
  processTicketUrls: AddTickets_processTicketUrls;
}

export interface AddTicketsVariables {
  showingId: FilmstundShowingID;
  tickets?: string[] | null;
}
