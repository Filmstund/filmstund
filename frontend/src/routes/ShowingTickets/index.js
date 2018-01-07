import { compose, withProps } from "recompose";
import { withRouter } from "react-router";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import TicketContainer from "./TicketContainer";

const routerParamsToShowingId = ({ match }) => {
  const { showingId } = match.params;

  return { showingId };
};

const data = graphql(gql`
  query TicketQuery($showingId: UUID!) {
    me: currentUser {
      id
    }
    showing(id: $showingId) {
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
`);

export default compose(withRouter, withProps(routerParamsToShowingId), data)(
  TicketContainer
);
