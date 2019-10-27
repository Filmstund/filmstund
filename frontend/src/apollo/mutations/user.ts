import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import { completeUserFragment } from "../queries/currentUser";
import { UpdateUser, UpdateUserVariables } from "./__generated__/UpdateUser";

const updateUserMutation = gql`
  mutation UpdateUser($user: NewUserInfo!) {
    editedUser: updateUser(newInfo: $user) {
      ...CompleteUser
      calendarFeedUrl
    }
  }
  ${completeUserFragment}
`;

export const useUpdateUserMutation = () =>
  useMutation<UpdateUser, UpdateUserVariables>(updateUserMutation);
