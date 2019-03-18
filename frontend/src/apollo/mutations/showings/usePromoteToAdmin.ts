import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import {
  PromoteToAdmin,
  PromoteToAdminVariables
} from "../__generated__/PromoteToAdmin";

const promoteToAdminMutation = gql`
  mutation PromoteToAdmin($showingId: UUID!, $userId: UserID!) {
    promoteToAdmin(showingId: $showingId, userToPromote: $userId) {
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
  const mutate = useMutation<PromoteToAdmin, PromoteToAdminVariables>(
    promoteToAdminMutation
  );

  return (showingId: string, userId: string) =>
    mutate({
      variables: { showingId, userId },
      refetchQueries: ["SingleShowing"]
    });
};
