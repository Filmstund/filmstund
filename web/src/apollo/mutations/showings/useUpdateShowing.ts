import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  UpdateShowingMutation,
  UpdateShowingMutationVariables,
  UpdateShowingInput,
} from "../../../__generated__/types";

const updateShowingMutation = gql`
  mutation UpdateShowing($showingId: UUID!, $showing: UpdateShowingInput!) {
    updateShowing(showingID: $showingId, newValues: $showing) {
      id
      time
      date
      ticketsBought
      price
      private
      payToUser {
        id
      }
    }
  }
`;

export const useUpdateShowing = () => {
  const [mutate] = useMutation<
    UpdateShowingMutation,
    UpdateShowingMutationVariables
  >(updateShowingMutation);

  return (showingId: string, showing: UpdateShowingInput) =>
    mutate({ variables: { showing, showingId } });
};
