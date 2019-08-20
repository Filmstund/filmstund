import React from "react";
import { render, cleanup } from "@testing-library/react";

import {TicketContainer} from "./TicketContainer";
import { createMockTicket, createMockSeat } from "./__mocks__/ticket";

const mockUserData = {
  id: "this-is-mock-user-id"
};

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
    myTickets: [createMockTicket(1, 2, 3)]
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
      createMockSeat(2, 3, 5, 0),
      createMockSeat(2, 4, 10, 0),
      createMockSeat(3, 5, 5, 5),
      createMockSeat(3, 6, 10, 5)
    ],
    myTickets: [
      createMockTicket(1, 2, 3),
      createMockTicket(2, 2, 4),
      createMockTicket(3, 3, 5),
      createMockTicket(4, 3, 6)
    ]
  }
};

afterEach(cleanup);

describe("<TicketContainer />", () => {
  it("renders without crashing", () => {
    const { container } = render(<TicketContainer data={minimalMockData} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the correct amount of tickets", () => {
    const { queryAllByText } = render(<TicketContainer data={mockData} />);
    expect(queryAllByText("mock-cinema")).toHaveLength(4);
  });
});
