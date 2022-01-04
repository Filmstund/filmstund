import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  DeleteForetagsbiljettMutation,
  DeleteForetagsbiljettMutationVariables,
} from "../../__generated__/types";

export const useDeleteForetagsbiljett = () =>
  useMutation<
    DeleteForetagsbiljettMutation,
    DeleteForetagsbiljettMutationVariables
  >(
    gql`
      mutation DeleteForetagsbiljett($ticket: GiftCertificateInput!) {
        deleteGiftCertificate(giftCert: $ticket) {
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
