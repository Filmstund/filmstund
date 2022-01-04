import { gql } from "@apollo/client";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { navigateToEditShowing } from "../common/navigators";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import { BuyModal } from "./BuyModal";
import { SingleShowingQuery } from "../../__generated__/types";
import { CopyHighlightStringButton } from "./CopyHighlightStringButton";

interface Props {
  onBeforeOpenBuyModal: () => Promise<any>;
  showing: NonNullable<SingleShowingQuery["showing"]>;
}

interface State {
  adminMessage: string | null;
  loadingModal: boolean;
  showModal: boolean;
}

const initialState: State = {
  adminMessage: null,
  loadingModal: false,
  showModal: false,
};

const AdminAction: React.FC<Props> = ({ onBeforeOpenBuyModal, showing }) => {
  const [state, setState] = useState(initialState);
  const { showModal, loadingModal, adminMessage } = state;

  const handleStartBooking = useCallback(async () => {
    setState((state) => ({
      ...state,
      showModal: true,
      loadingModal: true,
    }));

    await onBeforeOpenBuyModal();

    setState((state) => ({
      ...state,
      loadingModal: false,
    }));
  }, [setState, onBeforeOpenBuyModal]);

  const navigate = useNavigate();

  const handlePressEdit = useCallback(() => {
    navigateToEditShowing(navigate, showing);
  }, [navigate, showing]);

  const { ticketsBought } = showing;

  return (
    <>
      {showModal && (
        <BuyModal
          loading={loadingModal}
          showing={showing}
          closeModal={() =>
            setState((state) => ({ ...state, showModal: false }))
          }
        />
      )}
      <CopyHighlightStringButton
        meId={showing.admin.id}
        participants={showing.attendees}
      />
      {adminMessage && <div>{adminMessage}</div>}
      {ticketsBought ? (
        <GrayButton onClick={handleStartBooking}>
          Visa betalningsstatus
        </GrayButton>
      ) : (
        <MainButton onClick={handleStartBooking}>
          Alla är med, nu bokar vi!
        </MainButton>
      )}
      <GrayButton onClick={handlePressEdit}>Ändra besök</GrayButton>
    </>
  );
};

export const adminActionFragments = gql`
  fragment ShowingAdmin on Showing {
    id
    price
    private
    filmstadenShowingID
    ticketsBought
    cinemaScreen {
      id
      name
    }
    payToUser {
      id
    }
    adminPaymentDetails {
      filmstadenBuyLink
      attendees {
        userID
        hasPaid
        amountOwed
        filmstadenMembershipID
        giftCertificateUsed {
          number
        }
        user {
          id
          nick
          firstName
          lastName
          phone
        }
      }
    }
  }
`;

export default AdminAction;
