import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  TogglePaidChange,
  TogglePaidChangeVariables,
} from "./__generated__/TogglePaidChange";

const togglePaidChangeMutation = gql`
  mutation TogglePaidChange($paymentInfo: ParticipantPaymentInput!) {
    updateParticipantPaymentInfo(paymentInfo: $paymentInfo) {
      id
      hasPaid
    }
  }
`;

export const useTogglePaidChange = () =>
  useMutation<TogglePaidChange, TogglePaidChangeVariables>(
    togglePaidChangeMutation,
    { refetchQueries: ["ShowingsQuery"] }
  );
