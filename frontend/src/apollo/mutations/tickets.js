import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { wrapMutate } from "../../store/apollo";

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

export const addTickets = graphql(
  gql`
    mutation AddTickets($showingId: UUID!, $tickets: [String!]) {
      processTicketUrls(showingId: $showingId, ticketUrls: $tickets) {
        ...Ticket
      }
    }
    ${ticketFragment}
  `,
  {
    props: ({ mutate }) => ({
      addTickets: (showingId, tickets) =>
        wrapMutate(mutate, { showingId, tickets })
    })
  }
);
