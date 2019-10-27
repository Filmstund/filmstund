import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import { UpdateShowingInput } from "../../../__generated__/globalTypes";
import {
  UpdateShowing,
  UpdateShowingVariables
} from "./__generated__/UpdateShowing";

const updateShowingMutation = gql`
  mutation UpdateShowing($showingId: ShowingID!, $showing: UpdateShowingDTOInput!) {
    updateShowing(showingId: $showingId, newValues: $showing) {
      id
      time
      date
      ticketsBought
      price
      payToUser {
        id
      }
    }
  }
`;

export const useUpdateShowing = () => {
  const [mutate] = useMutation<UpdateShowing, UpdateShowingVariables>(
    updateShowingMutation
  );

  return (showingId: string, showing: UpdateShowingInput) =>
    mutate({ variables: { showing, showingId } });
};
