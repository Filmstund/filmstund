import { compose, withProps, branch, renderComponent } from "recompose";
import { withRouter } from "react-router";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import TicketContainer from "./TicketContainer";
import Loader from "../../ProjectorLoader";
import { wrapMutate } from "../../store/apollo";

const routerParamsToShowingId = ({ match, history }) => {
  const { webId } = match.params;

  return { webId };
};

const ticketFragment = gql`
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

const data = graphql(
  gql`
    query TicketQuery($webId: Base64ID!) {
      me: currentUser {
        id
      }
      showing(webId: $webId) {
        ...Ticket
      }
    }
    ${ticketFragment}
  `,
  {
    options: {
      fetchPolicy: "cache-and-network"
    }
  }
);

const addTickets = graphql(
  gql`
    mutation AddTickets($showingId: UUID!, $tickets: [String!]) {
      processTicketUrls(showingId: $showingId, ticketUrls: $tickets) {
        ...Ticket
      }
    }
    ${ticketFragment}
  `,
  {
    props: ({ mutate, ownProps: { showingId } }) => ({
      addTickets: tickets => wrapMutate(mutate, { showingId, tickets })
    })
  }
);

const isLoading = branch(
  ({ data: { showing } }) => !showing,
  renderComponent(Loader)
);

export default compose(
  withRouter,
  withProps(routerParamsToShowingId),
  data,
  addTickets,
  isLoading
)(TicketContainer);
