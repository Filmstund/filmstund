import gql from "graphql-tag";
import { useMutation } from "react-apollo";

import { AddTickets, AddTicketsVariables } from "./__generated__/AddTickets";

export const ticketFragment = gql`
  fragment Ticket on Showing {
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
    sfSeatMap {
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
        row
        number
      }
      date
      time
      movieName
      movieRating
      showAttributes
    }
  }
`;

const addTicketsMutation = gql`
  mutation AddTickets($showingId: UUID!, $tickets: [String!]) {
    processTicketUrls(showingId: $showingId, ticketUrls: $tickets) {
      ...Ticket
    }
  }
  ${ticketFragment}
`;

export const useAddTickets = () => {
  const [mutate] = useMutation<AddTickets, AddTicketsVariables>(
    addTicketsMutation
  );

  return (showingId: string, tickets: string[]) =>
    mutate({ variables: { showingId, tickets } });
};
