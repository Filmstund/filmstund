import { compose, withProps, branch, renderComponent } from "recompose";
import { withRouter } from "react-router";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import TicketContainer from "./TicketContainer";
import Loader from "../../ProjectorLoader";
import { wrapMutate } from "../../store/apollo";

const routerParamsToShowingId = ({ match, history }) => {
  const { showingId } = match.params;

  const navigateToShowing = () => history.push(`/showings/${showingId}`);

  return { showingId, navigateToShowing };
};

const data = graphql(
  gql`
    query TicketQuery($showingId: UUID!) {
      me: currentUser {
        id
      }
      showing(id: $showingId) {
        id
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
        myTickets {
          id
          barcode
          customerType
          customerTypeDefinition
          cinema
          screen
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
    }
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
        id
        admin {
          id
        }
        myTickets {
          id
          barcode
          customerType
          customerTypeDefinition
          cinema
          screen
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
    }
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
