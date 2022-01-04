import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  TogglePaidChangeMutation,
  TogglePaidChangeMutationVariables,
} from "../../../__generated__/types";

const togglePaidChangeMutation = gql`
  mutation TogglePaidChange($paymentInfo: AttendeePaymentInfoInput!) {
    updateAttendeePaymentInfo(paymentInfo: $paymentInfo) {
      userID
      hasPaid
    }
  }
`;

export const useTogglePaidChange = () =>
  useMutation<TogglePaidChangeMutation, TogglePaidChangeMutationVariables>(
    togglePaidChangeMutation,
    { refetchQueries: ["ShowingsQuery"] }
  );
