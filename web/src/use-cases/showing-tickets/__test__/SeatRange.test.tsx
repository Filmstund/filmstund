import { cleanup, render } from "@testing-library/react";
import * as React from "react";
import { Ticket_ticketRange } from "../../../apollo/mutations/__generated__/Ticket";
import { SeatRange } from "../SeatRange";

const ticketRange: Ticket_ticketRange = {
  rows: [1, 2, 3, 4, 5],
  seatings: [
    {
      row: 1,
      numbers: [1, 2, 3],
      __typename: "SeatRange",
    },
    {
      row: 2,
      numbers: [8, 9, 10, 11],
      __typename: "SeatRange",
    },
    {
      row: 3,
      numbers: [19, 20, 21, 22],
      __typename: "SeatRange",
    },
    {
      row: 4,
      numbers: [29, 30, 31],
      __typename: "SeatRange",
    },
    {
      row: 5,
      numbers: [39, 40],
      __typename: "SeatRange",
    },
  ],
  __typename: "TicketRange",
};

afterEach(cleanup);

describe("<SeatRange />", () => {
  it("works", () => {
    const { queryByText } = render(<SeatRange ticketRange={ticketRange} />);
    const text = queryByText("29-31");
    const text2 = queryByText("19-22");
    expect(text).toBeDefined();
    expect(text2).toBeDefined();
  });
});
