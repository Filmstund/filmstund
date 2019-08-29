import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { DeleteForetagsbiljett, DeleteForetagsbiljettVariables } from "./__generated__/DeleteForetagsbiljett";

export const useDeleteForetagsbiljett = () =>
useMutation<DeleteForetagsbiljett, DeleteForetagsbiljettVariables>(
  gql`
      mutation DeleteForetagsbiljett($ticket: ForetagsbiljettInput!) {
          deleteForetagsBiljett(biljett: $ticket) {
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
