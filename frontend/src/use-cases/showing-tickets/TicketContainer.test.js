import React from "react";
import { render } from "react-testing-library";

import TicketContainer from "./TicketContainer";

const mockUserData = {
  id: "this-is-mock-user-id"
};

const createMockSeat = (row, number) => ({
  row,
  number,
  coordinates: {
    x: 1,
    y: 0
  },
  dimensions: {
    width: 10,
    height: 10
  }
});

const createMockTicket = (id, row, number) => ({
  id,
  barcode: "this-is-barcode",
  customerType: "mock-customer-type",
  customerTypeDefinition: "mock-customer-type-definition",
  cinema: "mock-cinema",
  screen: "mock-screen",
  profileId: "mock-profile-id",
  seat: {
    row,
    number
  },
  date: "2018-10-10",
  time: "20:00",
  movieName: "mock-movie-name",
  movieRating: "R",
  showAttributes: ["3D"]
});

const minimalMockData = {
  me: mockUserData,
  showing: {
    id: "this-is-mock-showing-id",
    admin: mockUserData,
    ticketRange: {
      rows: [],
      seatings: []
    },
    sfSeatMap: [],
    myTickets: []
  }
};

const mockData = {
  me: mockUserData,
  showing: {
    id: "this-is-mock-showing-id",
    admin: mockUserData,
    ticketRange: {
      rows: [2, 3],
      seatings: [
        {
          row: 2,
          numbers: [3, 4]
        },
        {
          row: 3,
          numbers: [5, 6]
        }
      ]
    },
    sfSeatMap: [
      createMockSeat(2, 3),
      createMockSeat(2, 4),
      createMockSeat(3, 5),
      createMockSeat(3, 6)
    ],
    myTickets: [
      createMockTicket(1, 2, 3),
      createMockTicket(2, 2, 4),
      createMockTicket(3, 3, 5),
      createMockTicket(4, 3, 6)
    ]
  }
};

describe("<TicketContainer />", () => {
  it("renders without crashing", () => {
    const { container } = render(<TicketContainer data={minimalMockData} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the correct amount of tickets", () => {
    const { getAllByText } = render(<TicketContainer data={mockData} />);
    expect(getAllByText("mock-cinema")).toHaveLength(4);
  });
});
