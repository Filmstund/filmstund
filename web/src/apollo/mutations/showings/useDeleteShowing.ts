import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  DeleteShowingMutation,
  DeleteShowingMutationVariables,
} from "../../../__generated__/types";

const deleteShowingMutation = gql`
  mutation DeleteShowing($showingId: UUID!) {
    deleteShowing(showingID: $showingId) {
      id
    }
  }
`;

export const useDeleteShowing = () => {
  const [mutate] = useMutation<
    DeleteShowingMutation,
    DeleteShowingMutationVariables
  >(deleteShowingMutation);

  return (showingId: string) =>
    mutate({ variables: { showingId }, refetchQueries: ["ShowingsQuery"] });
};
