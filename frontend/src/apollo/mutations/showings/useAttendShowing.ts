import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import {
  AttendShowing,
  AttendShowingVariables
} from "../__generated__/AttendShowing";
import { PaymentOption } from "../../../../__generated__/globalTypes";
import {
  UnattendShowing,
  UnattendShowingVariables
} from "../__generated__/UnattendShowing";

const participantsFragment = gql`
  fragment ShowingParticipant on Showing {
    id
    participants {
      paymentType
      user {
        id
        nick
        firstName
        lastName
        avatar
      }
    }
  }
`;

const attendShowingMutation = gql`
  mutation AttendShowing($showingId: UUID!, $paymentOption: PaymentOption!) {
    attendShowing(showingId: $showingId, paymentOption: $paymentOption) {
      ...ShowingParticipant
    }
  }
  ${participantsFragment}
`;

const unattendShowingMutation = gql`
  mutation UnattendShowing($showingId: UUID!) {
    unattendShowing(showingId: $showingId) {
      ...ShowingParticipant
    }
  }
  ${participantsFragment}
`;

export const useAttendShowing = () => {
  const mutate = useMutation<AttendShowing, AttendShowingVariables>(
    attendShowingMutation
  );

  return (showingId: string, paymentOption: PaymentOption) =>
    mutate({ variables: { showingId, paymentOption } });
};

export const useUnattendShowing = () => {
  const mutate = useMutation<UnattendShowing, UnattendShowingVariables>(
    unattendShowingMutation
  );

  return (showingId: string) => mutate({ variables: { showingId } });
};
