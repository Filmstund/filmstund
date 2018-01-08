import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { withProps } from "recompose";
import EditShowingForm from "../EditShowingForm";
import { showingFragment } from "../Showing";
import { updateShowing } from "../fragments/showings";

const routerParamsToShowingId = ({ match, history }) => {
  const { showingId } = match.params;

  const navigateToShowing = () => history.push(`/showings/${showingId}`);

  return { showingId, navigateToShowing };
};

const data = graphql(
  gql`
    query EditShowing($showingId: UUID!) {
      me: currentUser {
        id
      }
      showing(id: $showingId) {
        ...Showing
        price
        private
        payToUser {
          id
        }
      }
    }
    ${showingFragment}
  `,
  { options: { errorPolicy: "ignore" } }
);

export default compose(withProps(routerParamsToShowingId), data, updateShowing)(
  EditShowingForm
);
