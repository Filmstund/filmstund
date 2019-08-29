import gql from "graphql-tag";
import React, { useCallback, useState } from "react";
import { useRouter } from "../../lib/useRouter";
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

  const { history } = useRouter();

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
      <CopyHighlightStringButton participants={showing.participants} />
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
    filmstadenRemoteEntityId
    filmstadenScreen {
      filmstadenId
      name
    }
    payToUser {
      id
    }
    adminPaymentDetails {
      filmstadenBuyLink
      filmstadenData {
        user {
          id
          nick
          firstName
          lastName
        }
        filmstadenMembershipId
        foretagsbiljett
      }
      participantPaymentInfos {
        id
        hasPaid
        amountOwed
        user {
          id
          nick
          name
          phone
        }
      }
    }
  }
`;

export default AdminAction;
