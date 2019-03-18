import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import {
  TogglePaidChange,
  TogglePaidChangeVariables
} from "../__generated__/TogglePaidChange";
import { ParticipantPaymentInput } from "../../../../__generated__/globalTypes";

const togglePaidChangeMutation = gql`
  mutation TogglePaidChange($paymentInfo: ParticipantPaymentInput!) {
    updateParticipantPaymentInfo(paymentInfo: $paymentInfo) {
      id
      hasPaid
    }
  }
`;

export const useTogglePaidChange = () => {
  const mutate = useMutation<TogglePaidChange, TogglePaidChangeVariables>(
    togglePaidChangeMutation
  );

  return (paymentInfo: ParticipantPaymentInput) =>
    mutate({ variables: { paymentInfo }, refetchQueries: ["ShowingsQuery"] });
};
