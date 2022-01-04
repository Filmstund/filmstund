import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { completeUserFragment } from "../queries/currentUser";
import {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "../../__generated__/types";

const updateUserMutation = gql`
  mutation UpdateUser($user: UserDetailsInput!) {
    editedUser: updateUser(newInfo: $user) {
      ...CompleteUser
      calendarFeedUrl
    }
  }
  ${completeUserFragment}
`;

export const useUpdateUserMutation = () =>
  useMutation<UpdateUserMutation, UpdateUserMutationVariables>(
    updateUserMutation
  );
