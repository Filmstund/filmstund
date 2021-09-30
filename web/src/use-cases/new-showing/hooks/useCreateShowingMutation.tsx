import { useMutation } from "@apollo/react-hooks";
import { gql } from "@apollo/client";
import { oldShowingFragment } from "../../common/showing/Showing";
import {
  CreateShowing,
  CreateShowingVariables,
} from "./__generated__/CreateShowing";

export const useCreateShowingMutation = () =>
  useMutation<CreateShowing, CreateShowingVariables>(
    gql`
      mutation CreateShowing($showing: CreateShowingInput!) {
        showing: createShowing(showing: $showing) {
          ...OldShowing
        }
      }
      ${oldShowingFragment}
    `
  );
