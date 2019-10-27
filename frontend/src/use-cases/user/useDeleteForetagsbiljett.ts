import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { DeleteForetagsbiljett, DeleteForetagsbiljettVariables } from "./__generated__/DeleteForetagsbiljett";

export const useDeleteForetagsbiljett = () =>
useMutation<DeleteForetagsbiljett, DeleteForetagsbiljettVariables>(
  gql`
      mutation DeleteForetagsbiljett($ticket: GiftCertificateDTOInput!) {
          deleteGiftCertificate(giftCert: $ticket) {
              id
              giftCertificates {
                  number
                  expiresAt
                  status
              }
          }
      }
  `
);
