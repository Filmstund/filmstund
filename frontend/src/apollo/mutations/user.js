import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { completeUserFragment } from "../queries/currentUser";
import { wrapMutate } from "../../store/apollo";

export const updateUser = graphql(
  gql`
    mutation UpdateUser($user: NewUserInfo!) {
      editedUser: updateUser(newInfo: $user) {
        ...CompleteUser
        calendarFeedUrl
      }
    }
    ${completeUserFragment}
  `,
  {
    props: ({ mutate }) => ({
      updateUser: user => wrapMutate(mutate, { user })
    })
  }
);
