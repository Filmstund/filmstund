import * as React from "react";
import { useCallback } from "react";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { PaymentParticipantsList } from "./components/PaymentParticipantsList";
import {
  ShowingAdminFragment,
  useTogglePaidChangeMutation,
} from "../../__generated__/types";
import { InputSpinner } from "./InputSpinner";
import { AdminAttendeePaymentDetails } from "./containers/types";

interface AdminModalAfterTicketsBoughtProps {
  showingId: string;
  participantPaymentInfos: AdminAttendeePaymentDetails[];
}

export const AdminModalAfterTicketsBought: React.FC<
  AdminModalAfterTicketsBoughtProps
> = ({ showingId, participantPaymentInfos }) => {
  const [
    { fetching: mutationInProgress, error: mutationError },
    togglePaidChange,
  ] = useTogglePaidChangeMutation();

  const handlePaidChange = useCallback(
    (
      info: NonNullable<
        ShowingAdminFragment["adminPaymentDetails"]
      >["attendees"][0]
    ) => {
      const { user, hasPaid, amountOwed } = info!;

      togglePaidChange({
        paymentInfo: {
          amountOwed,
          hasPaid,
          showingID: showingId,
          userID: user.id,
        },
      });
    },
    [showingId, togglePaidChange]
  );

  return (
    <>
      <PaymentParticipantsList
        handlePaidChange={handlePaidChange}
        participants={participantPaymentInfos}
      />
      {mutationInProgress && <InputSpinner />}
      <StatusMessageBox errors={mutationError ? [mutationError] : null} />
    </>
  );
};
