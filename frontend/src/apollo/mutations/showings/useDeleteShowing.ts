import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import {
  DeleteShowing,
  DeleteShowingVariables
} from "../__generated__/DeleteShowing";

const deleteShowingMutation = gql`
  mutation DeleteShowing($showingId: UUID!) {
    deleteShowing(showingId: $showingId) {
      id
    }
  }
`;

export const useDeleteShowing = () => {
  const [mutate] = useMutation<DeleteShowing, DeleteShowingVariables>(
    deleteShowingMutation
  );

  return (showingId: string) =>
    mutate({ variables: { showingId }, refetchQueries: ["ShowingsQuery"] });
};
