import gql from "graphql-tag";
import { useMutation } from "react-apollo";

import { AddTickets, AddTicketsVariables } from "./__generated__/AddTickets";

export const ticketFragment = gql`
  fragment Ticket on ShowingDTO {
    id
    webId
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
      profileId
      seat {
        number
        row
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
  mutation AddTickets($showingId: ShowingID!, $tickets: [String!]) {
    processTicketUrls(showingId: $showingId, ticketUrls: $tickets) {
      ...Ticket
    }
  }
  ${ticketFragment}
`;

export const useAddTickets = () =>
  useMutation<AddTickets, AddTicketsVariables>(addTicketsMutation);
