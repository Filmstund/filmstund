import * as React from "react";
import { useCallback, useState } from "react";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { PaymentParticipantsList } from "./components/PaymentParticipantsList";
import { useTogglePaidChangeMutation } from "../../__generated__/types";
import { InputSpinner } from "./InputSpinner";
import { AdminAttendeePaymentDetails } from "./containers/types";
import { useToaster } from "../../common/toast/ToastContext";

interface AdminModalAfterTicketsBoughtProps {
  showingId: string;
  participantPaymentInfos: AdminAttendeePaymentDetails[];
}

export const AdminModalAfterTicketsBought: React.FC<
  AdminModalAfterTicketsBoughtProps
> = ({ showingId, participantPaymentInfos }) => {
  const [{ fetching: isMutating, error: mutationError }, togglePaidChange] =
    useTogglePaidChangeMutation();

  const toast = useToaster();

  const handlePaidChange = useCallback(
    async (info: AdminAttendeePaymentDetails) => {
      const { user, hasPaid, amountOwed } = info;

      const { error } = await togglePaidChange({
        paymentInfo: {
          amountOwed,
          hasPaid,
          showingID: showingId,
          userID: user.id,
        },
      });

      if (error) {
        toast({ variant: "danger", text: error.message });
      }
    },
    [toast, showingId, togglePaidChange]
  );

  return (
    <>
      <PaymentParticipantsList
        handlePaidChange={handlePaidChange}
        participants={participantPaymentInfos}
      />
      {isMutating && <InputSpinner />}
      <StatusMessageBox errors={mutationError ? [mutationError] : null} />
    </>
  );
};
