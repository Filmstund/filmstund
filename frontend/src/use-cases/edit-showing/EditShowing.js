import { graphql } from "react-apollo";
import { withRouter } from "react-router";
import gql from "graphql-tag";
import { withProps, renderComponent, branch, compose } from "recompose";
import EditShowingForm from "./EditShowingForm";
import { oldShowingFragment } from "../common/showing/Showing";
import Loader from "../common/utils/ProjectorLoader";

const routerParamsToShowingId = ({ match }) => {
  const { webId } = match.params;

  return { webId };
};

const data = graphql(
  gql`
    query EditShowing($webId: Base64ID!) {
      me: currentUser {
        id
      }
      showing(webId: $webId) {
        ...OldShowing
        price
        private
        filmstadenRemoteEntityId
        location {
          cityAlias
        }
        payToUser {
          id
        }
      }
      previousLocations {
        name
      }
    }
    ${oldShowingFragment}
  `,
  { options: { errorPolicy: "ignore", fetchPolicy: "cache-and-network" } }
);

const isLoading = branch(
  ({ data: { showing } }) => !showing,
  renderComponent(Loader)
);

export default compose(
  withRouter,
  withProps(routerParamsToShowingId),
  data,
  isLoading
)(EditShowingForm);
