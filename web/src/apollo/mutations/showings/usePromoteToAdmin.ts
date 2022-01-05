import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  PromoteToAdminMutation,
  PromoteToAdminMutationVariables,
} from "../../../__generated__/types";

const promoteToAdminMutation = gql`
  mutation PromoteToAdmin($showingId: UUID!, $userId: UUID!) {
    promoteToAdmin(showingID: $showingId, userToPromote: $userId) {
      admin {
        id
      }
      payToUser {
        id
      }
      attendeePaymentDetails {
        payTo {
          id
          nick
          firstName
          lastName
          phone
        }
        swishLink
        hasPaid
        amountOwed
      }
    }
  }
`;

export const usePromoteToAdmin = () => {
  const [mutate] = useMutation<
    PromoteToAdminMutation,
    PromoteToAdminMutationVariables
  >(promoteToAdminMutation);

  return (showingId: string, userId: string) =>
    mutate({
      variables: { showingId, userId },
      refetchQueries: ["SingleShowing"],
    });
};
