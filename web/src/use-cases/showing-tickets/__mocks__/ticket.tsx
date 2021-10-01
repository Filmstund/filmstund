export const createMockSeat = (
  row: number,
  number: number,
  x: number,
  y: number
) => ({
  row,
  number,
  coordinates: {
    x,
    y,
  },
  dimensions: {
    width: 10,
    height: 10,
  },
});

export const createMockTicket = (id: string, row: number, number: number) => ({
  id,
  barcode: "this-is-barcode",
  customerType: "mock-customer-type",
  customerTypeDefinition: "mock-customer-type-definition",
  cinema: "mock-cinema",
  screen: "mock-screen",
  profileId: "mock-profile-id",
  seat: {
    row,
    number,
  },
  date: "2018-10-10",
  time: "20:00",
  movieName: "mock-movie-name",
  movieRating: "R",
  showAttributes: ["3D"],
});
