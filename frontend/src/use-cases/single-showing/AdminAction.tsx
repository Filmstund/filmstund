import gql from "graphql-tag";
import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { navigateToEditShowing } from "../common/navigators";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import { BuyModal } from "./BuyModal";
import { SingleShowing_showing } from "./containers/__generated__/SingleShowing";
import { CopyHighlightStringButton } from "./CopyHighlightStringButton";

interface Props {
  onBeforeOpenBuyModal: () => Promise<any>;
  showing: SingleShowing_showing;
}

interface State {
  adminMessage: string | null;
  loadingModal: boolean;
  showModal: boolean;
}

const initialState: State = {
  adminMessage: null,
  loadingModal: false,
  showModal: false
};

const AdminAction: React.FC<Props> = ({ onBeforeOpenBuyModal, showing }) => {
  const [state, setState] = useState(initialState);
  const { showModal, loadingModal, adminMessage } = state;

  const handleStartBooking = useCallback(
    async () => {
      setState(state => ({
        ...state,
        showModal: true,
        loadingModal: true
      }));

      await onBeforeOpenBuyModal();

      setState(state => ({
        ...state,
        loadingModal: false
      }));
    },
    [setState, onBeforeOpenBuyModal]
  );

  const history = useHistory();

  const handlePressEdit = useCallback(
    () => {
      navigateToEditShowing(history, showing);
    },
    [history, showing]
  );

  const { ticketsBought } = showing;

  return (
    <>
      {showModal && (
        <BuyModal
          loading={loadingModal}
          showing={showing}
          closeModal={() => setState(state => ({ ...state, showModal: false }))}
        />
      )}
      <CopyHighlightStringButton
        meId={showing.admin.id}
        participants={
          showing.adminPaymentDetails
            ? showing.adminPaymentDetails.attendees
            : []
        }
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
  fragment ShowingAdmin on ShowingDTO {
    id
    price
    filmstadenShowingId
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
        userId
        hasPaid
        amountOwed
        filmstadenMembershipId
        giftCertificateUsed {
          number
        }
        user {
          id
          nick
          firstName
          lastName
          name
          phone
        }
      }
    }
  }
`;

export default AdminAction;
