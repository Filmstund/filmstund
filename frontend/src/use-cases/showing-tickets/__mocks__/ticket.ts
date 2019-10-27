import {
  Ticket_filmstadenSeatMap,
  Ticket_myTickets
} from "../../../apollo/mutations/__generated__/Ticket";

export const createMockSeat = (
  row: number,
  number: number,
  x: number,
  y: number
): Ticket_filmstadenSeatMap => ({
  __typename: "FilmstadenSeatMapDTO",
  seatType: "TEST",
  row,
  number,
  coordinates: {
    __typename: "FilmstadenSeatCoordinates",
    x,
    y
  },
  dimensions: {
    __typename: "FilmstadenSeatDimensions",
    width: 10,
    height: 10
  }
});

export const createMockTicket = (
  id: string,
  row: number,
  number: number
): Ticket_myTickets => ({
  __typename: "TicketDTO",
  id,
  barcode: "this-is-barcode",
  customerType: "mock-customer-type",
  customerTypeDefinition: "mock-customer-type-definition",
  cinema: "mock-cinema",
  screen: "mock-screen",
  profileId: "mock-profile-id",
  seat: {
    __typename: "Seat",
    row,
    number
  },
  date: "2018-10-10",
  time: "20:00",
  movieName: "mock-movie-name",
  movieRating: "R",
  attributes: ["3D"]
});
