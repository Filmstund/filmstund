import gql from "graphql-tag";
import { completeUserFragment } from "../queries/currentUser";
import { UpdateUser, UpdateUserVariables } from "./__generated__/UpdateUser";
import { NewUserInfo } from "../../../__generated__/globalTypes";
import { useMutation } from "react-apollo-hooks";

const updateUserMutation = gql`
  mutation UpdateUser($user: NewUserInfo!) {
    editedUser: updateUser(newInfo: $user) {
      ...CompleteUser
      calendarFeedUrl
    }
  }
  ${completeUserFragment}
`;

export const useUpdateUserMutation = () => (user: NewUserInfo) =>
  useMutation<UpdateUser, UpdateUserVariables>(updateUserMutation)({
    variables: { user }
  });
