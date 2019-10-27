import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { oldShowingFragment } from "../../common/showing/Showing";
import { CreateShowing, CreateShowingVariables } from "./__generated__/CreateShowing";

export const useCreateShowingMutation = () =>
useMutation<CreateShowing, CreateShowingVariables>(
  gql`
      mutation CreateShowing($showing: CreateShowingDTOInput!) {
          showing: createShowing(showing: $showing) {
              ...OldShowing
          }
      }
      ${oldShowingFragment}
  `
);