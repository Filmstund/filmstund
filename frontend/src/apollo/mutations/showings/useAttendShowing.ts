import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import {
  AttendShowing,
  AttendShowingVariables
} from "./__generated__/AttendShowing";
import { PaymentOption } from "../../../__generated__/globalTypes";
import {
  UnattendShowing,
  UnattendShowingVariables
} from "./__generated__/UnattendShowing";

const participantsFragment = gql`
  fragment ShowingAttendees on ShowingDTO {
    id
    attendees {
      # paymentType - not available for regular users
      userInfo {
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
  mutation AttendShowing($showingId: ShowingID!, $paymentOption: PaymentOption!) {
    attendShowing(showingId: $showingId, paymentOption: $paymentOption) {
      ...ShowingAttendees
    }
  }
  ${participantsFragment}
`;

const unattendShowingMutation = gql`
  mutation UnattendShowing($showingId: ShowingID!) {
    unattendShowing(showingId: $showingId) {
      ...ShowingAttendees
    }
  }
  ${participantsFragment}
`;

export const useAttendShowing = () => {
  const [mutate] = useMutation<AttendShowing, AttendShowingVariables>(
    attendShowingMutation
  );

  return (showingId: string, paymentOption: PaymentOption) =>
    mutate({ variables: { showingId, paymentOption } });
};

export const useUnattendShowing = () => {
  const [mutate] = useMutation<UnattendShowing, UnattendShowingVariables>(
    unattendShowingMutation
  );

  return (showingId: string) => mutate({ variables: { showingId } });
};
