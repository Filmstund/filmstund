import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { oldShowingFragment } from "../../common/showing/Showing";
import {
  CreateShowingMutation,
  CreateShowingMutationVariables,
} from "../../../__generated__/types";

export const useCreateShowingMutation = () =>
  useMutation<CreateShowingMutation, CreateShowingMutationVariables>(
    gql`
      mutation CreateShowing($showing: CreateShowingInput!) {
        showing: createShowing(showing: $showing) {
          ...OldShowing
        }
      }
      ${oldShowingFragment}
    `
  );
