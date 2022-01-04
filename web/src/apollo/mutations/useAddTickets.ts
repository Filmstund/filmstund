import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";

import {
  AddTicketsMutation,
  AddTicketsMutationVariables,
} from "../../__generated__/types";

export const ticketFragment = gql`
  fragment Ticket on Showing {
    id
    webID
    slug
    admin {
      id
    }
    ticketRange {
      rows
      seatings {
        row
        numbers
      }
    }
    filmstadenSeatMap {
      row
      number
      seatType
      coordinates {
        x
        y
      }
      dimensions {
        width
        height
      }
    }
    myTickets {
      id
      barcode
      customerType
      customerTypeDefinition
      cinema
      screen
      profileID
      seat {
        row
        number
      }
      date
      time
      movieName
      movieRating
      attributes
    }
  }
`;

const addTicketsMutation = gql`
  mutation AddTickets($showingId: UUID!, $tickets: [String!]) {
    processTicketUrls(showingID: $showingId, ticketUrls: $tickets) {
      ...Ticket
    }
  }
  ${ticketFragment}
`;

export const useAddTickets = () =>
  useMutation<AddTicketsMutation, AddTicketsMutationVariables>(
    addTicketsMutation
  );
