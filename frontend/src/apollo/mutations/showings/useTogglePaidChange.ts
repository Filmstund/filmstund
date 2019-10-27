import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import {
  TogglePaidChange,
  TogglePaidChangeVariables
} from "./__generated__/TogglePaidChange";

const togglePaidChangeMutation = gql`
  mutation TogglePaidChange($paymentInfo: AttendeePaymentInfoDTOInput!) {
    updateAttendeePaymentInfo(paymentInfo: $paymentInfo) {
      userId
      hasPaid
    }
  }
`;

export const useTogglePaidChange = () =>
  useMutation<TogglePaidChange, TogglePaidChangeVariables>(
    togglePaidChangeMutation,
    { refetchQueries: ["ShowingsQuery"] }
  );
