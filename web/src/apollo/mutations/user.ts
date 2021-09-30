import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
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
