import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  AddForetagsbiljettMutation,
  AddForetagsbiljettMutationVariables,
} from "../../__generated__/types";

export const useAddForetagsbiljett = () =>
  useMutation<AddForetagsbiljettMutation, AddForetagsbiljettMutationVariables>(
    gql`
      mutation AddForetagsbiljett($tickets: [GiftCertificateInput!]) {
        addGiftCertificates(giftCerts: $tickets) {
          id
          giftCertificates {
            number
            expireTime
            status
          }
        }
      }
    `
  );
