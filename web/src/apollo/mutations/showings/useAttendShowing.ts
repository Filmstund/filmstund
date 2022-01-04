import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  AttendShowingMutation,
  AttendShowingMutationVariables,
} from "../../../__generated__/types";
import { PaymentOption } from "../../../__generated__/types";
import {
  UnattendShowingMutation,
  UnattendShowingMutationVariables,
} from "../../../__generated__/types";

const participantsFragment = gql`
  fragment ShowingParticipant on Showing {
    id
    attendees {
      userInfo {
        id
        nick
        firstName
        lastName
        avatarURL
      }
    }
  }
`;

const attendShowingMutation = gql`
  mutation AttendShowing($showingId: UUID!, $paymentOption: PaymentOption!) {
    attendShowing(showingID: $showingId, paymentOption: $paymentOption) {
      ...ShowingParticipant
    }
  }
  ${participantsFragment}
`;

const unattendShowingMutation = gql`
  mutation UnattendShowing($showingId: UUID!) {
    unattendShowing(showingID: $showingId) {
      ...ShowingParticipant
    }
  }
  ${participantsFragment}
`;

export const useAttendShowing = () => {
  const [mutate] = useMutation<
    AttendShowingMutation,
    AttendShowingMutationVariables
  >(attendShowingMutation);

  return (showingId: string, paymentOption: PaymentOption) =>
    mutate({ variables: { showingId, paymentOption } });
};

export const useUnattendShowing = () => {
  const [mutate] = useMutation<
    UnattendShowingMutation,
    UnattendShowingMutationVariables
  >(unattendShowingMutation);

  return (showingId: string) => mutate({ variables: { showingId } });
};
