import ForetagsbiljettList from "./ForetagsbiljettList";
import { wrapMutate } from "../../store/apollo";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";

const addForetagsbiljett = graphql(
  gql`
    mutation AddForetagsbiljett($tickets: [ForetagsbiljettInput!]) {
      addForetagsBiljetter(biljetter: $tickets) {
        id
        foretagsbiljetter {
          number
          expires
          status
        }
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      addForetagsbiljett: tickets => wrapMutate(mutate, { tickets })
    })
  }
);

const deleteForetagsbiljett = graphql(
  gql`
    mutation DeleteForetagsbiljett($ticket: ForetagsbiljettInput!) {
      deleteForetagsBiljett(biljett: $ticket) {
        id
        foretagsbiljetter {
          number
          expires
          status
        }
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      deleteForetagsbiljett: ticket => wrapMutate(mutate, { ticket })
    })
  }
);

export default compose(
  addForetagsbiljett,
  deleteForetagsbiljett
)(ForetagsbiljettList);
