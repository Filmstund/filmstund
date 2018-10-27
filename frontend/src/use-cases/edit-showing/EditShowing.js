import { graphql, compose } from "react-apollo";
import { withRouter } from "react-router";
import gql from "graphql-tag";
import { withProps, renderComponent, branch } from "recompose";
import EditShowingForm from "./EditShowingForm";
import { showingFragment } from "../common/showing/Showing";
import { updateShowing, deleteShowing } from "../../apollo/mutations/showings";
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
        payToUser {
          id
        }
      }
      previousLocations {
        name
      }
    }
    ${showingFragment}
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
  updateShowing,
  deleteShowing,
  isLoading
)(EditShowingForm);
