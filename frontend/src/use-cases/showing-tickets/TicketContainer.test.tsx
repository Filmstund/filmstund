import { cleanup, render } from "@testing-library/react";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import React from "react";
import { ApolloProvider } from "react-apollo";
import { MemoryRouter as Router } from "react-router";
import {
  TicketQuery_me,
  TicketQuery_showing,
  TicketQuery_showing_admin
} from "./__generated__/TicketQuery";
import { createMockSeat, createMockTicket } from "./__mocks__/ticket";

import { TicketContainer } from "./TicketContainer";

const mockUserData: TicketQuery_me = {
  __typename: "UserDTO",
  id: "this-is-mock-user-id"
};

const mockAdminUserData: TicketQuery_showing_admin = {
  __typename: "PublicUserDTO",
  id: "this-is-mock-user-id"
};

const minimalMockData: TicketQuery_showing = {
  __typename: "ShowingDTO",
  id: "this-is-mock-showing-id",
  admin: mockAdminUserData,
  ticketRange: {
    __typename: "TicketRange",
    rows: [],
    seatings: []
  },
  filmstadenSeatMap: [],
  myTickets: [createMockTicket("1", 2, 3)],
  slug: "this-is-mock-showing-id",
  webId: "ajshdgaljkdhsg"
};

const mockData: TicketQuery_showing = {
  __typename: "ShowingDTO",
  id: "this-is-mock-showing-id",
  admin: mockAdminUserData,
  ticketRange: {
    __typename: "TicketRange",
    rows: [2, 3],
    seatings: [
      {
        __typename: "SeatRange",
        row: 2,
        numbers: [3, 4]
      },
      {
        __typename: "SeatRange",
        row: 3,
        numbers: [5, 6]
      }
    ]
  },
  filmstadenSeatMap: [
    createMockSeat(2, 3, 5, 0),
    createMockSeat(2, 4, 10, 0),
    createMockSeat(3, 5, 5, 5),
    createMockSeat(3, 6, 10, 5)
  ],
  myTickets: [
    createMockTicket("1", 2, 3),
    createMockTicket("2", 2, 4),
    createMockTicket("3", 3, 5),
    createMockTicket("4", 3, 6)
  ],
  slug: "this-is-mock-showing-id",
  webId: "ajshdgaljkdhsg"
};

afterEach(cleanup);

const createEmptyApolloClient = () =>
  new ApolloClient({ link: ApolloLink.empty(), cache: new InMemoryCache() });

describe("<TicketContainer />", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <ApolloProvider client={createEmptyApolloClient()}>
        <Router>
          <TicketContainer me={mockUserData} showing={minimalMockData} />
        </Router>
      </ApolloProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders the correct amount of tickets", () => {
    const { queryAllByText } = render(
      <ApolloProvider client={createEmptyApolloClient()}>
        <Router>
          <TicketContainer me={mockUserData} showing={mockData} />
        </Router>
      </ApolloProvider>
    );
    expect(queryAllByText("mock-cinema")).toHaveLength(4);
  });
});
