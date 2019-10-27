import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { AddForetagsbiljett, AddForetagsbiljettVariables } from "./__generated__/AddForetagsbiljett";

export const useAddForetagsbiljett = () =>
useMutation<AddForetagsbiljett, AddForetagsbiljettVariables>(
  gql`
      mutation AddForetagsbiljett($tickets: [GiftCertificateDTOInput!]) {
          addGiftCertificates(giftCerts: $tickets) {
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
