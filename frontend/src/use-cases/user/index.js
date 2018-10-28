import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { completeUserFragment } from "../../apollo/queries/currentUser";
import { branch, renderComponent } from "recompose";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import { updateUser } from "../../apollo/mutations/user";
import Profile from "./ProfileView";

const data = graphql(
  gql`
    query UserProfile {
      me: currentUser {
        ...CompleteUser
        calendarFeedUrl
      }
    }
    ${completeUserFragment}
  `,
  {
    options: { fetchPolicy: "cache-and-network" }
  }
);

const isLoading = branch(({ data: { me } }) => !me, renderComponent(Loader));

export default compose(
  data,
  updateUser,
  isLoading
)(Profile);
