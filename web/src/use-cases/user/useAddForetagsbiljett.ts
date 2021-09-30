import { useMutation } from "@apollo/react-hooks";
import { gql } from "@apollo/client";
import {
  AddForetagsbiljett,
  AddForetagsbiljettVariables,
} from "./__generated__/AddForetagsbiljett";

export const useAddForetagsbiljett = () =>
  useMutation<AddForetagsbiljett, AddForetagsbiljettVariables>(
    gql`
      mutation AddForetagsbiljett($tickets: [ForetagsbiljettInput!]) {
        addForetagsBiljetter(biljetter: $tickets) {
          id
          foretagsbiljetter {
            number
            expires
            status
          }
        }
      }
    `
  );
