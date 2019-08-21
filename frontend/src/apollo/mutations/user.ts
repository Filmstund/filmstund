import gql from "graphql-tag";
import { useMutation } from "react-apollo";

import { NewUserInfo } from "../../__generated__/globalTypes";
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

export const useUpdateUserMutation = () => {
  const [mutate] = useMutation<UpdateUser, UpdateUserVariables>(
    updateUserMutation
  );

  return (user: NewUserInfo) => mutate({ variables: { user } });
};
