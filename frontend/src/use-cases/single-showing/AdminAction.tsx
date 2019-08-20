import gql from "graphql-tag";
import React, { useCallback, useState } from "react";

import { useMarkAsBought } from "../../apollo/mutations/showings/useMarkAsBought";
import { useTogglePaidChange } from "../../apollo/mutations/showings/useTogglePaidChange";
import { useAddTickets } from "../../apollo/mutations/useAddTickets";
import { useRouter } from "../../lib/useRouter";
import { navigateToEditShowing } from "../common/navigators";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import BuyModal from "./BuyModal";
import {
  SingleShowing_showing,
  SingleShowing_showing_adminPaymentDetails_participantPaymentInfos
} from "./containers/__generated__/SingleShowing";
import { CopyHighlightStringButton } from "./CopyHighlightStringButton";

interface Props {
  onBeforeOpenBuyModal: () => Promise<any>;
  showing: SingleShowing_showing;
}

interface State {
  errors: Error[] | null;
  adminMessage: string | null;
  ticketPrice: number;
  cinemaTicketUrls: string[];
  buyData: null;
  loadingModal: boolean;
  showModal: boolean;
}

const getInitialState = (showing: SingleShowing_showing): State => ({
  errors: null,
  adminMessage: null,
  ticketPrice: showing.price / 100,
  cinemaTicketUrls: [],
  buyData: null,
  loadingModal: false,
  showModal: false
});

const AdminAction: React.FC<Props> = ({ onBeforeOpenBuyModal, showing }) => {
  const [state, setState] = useState(() => getInitialState(showing));
  const [cinemaTicketUrls, setCinemaTicketUrls] = useState<string[]>([]);

  const { errors, ticketPrice, showModal, loadingModal, adminMessage } = state;

  const setPrice = useCallback(
    (price: string) => {
      const priceNumber = parseInt(price, 10);

      setState(state => ({
        ...state,
        ticketPrice: priceNumber
      }));
    },
    [setState]
  );

  const togglePaidChange = useTogglePaidChange();

  const handlePaidChange = useCallback(
    (
      info: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos
    ) => {
      const { id, user, hasPaid, amountOwed } = info;

      togglePaidChange({
        amountOwed,
        hasPaid,
        id,
        showingId: showing.id,
        userId: user.id
      });
    },
    [showing, togglePaidChange]
  );

  const handleStartBooking = useCallback(
    async () => {
      setState(state => ({
        ...state,
        showModal: true,
        loadingModal: true,
        errors: null
      }));

      await onBeforeOpenBuyModal();

      setState(state => ({
        ...state,
        loadingModal: false
      }));
    },
    [setState, onBeforeOpenBuyModal]
  );

  const addTickets = useAddTickets();
  const markAsBought = useMarkAsBought();

  const handleMarkBought = useCallback(
    () => {
      const nonEmptyTicketUrls = cinemaTicketUrls.filter(
        line => line.trim().length !== 0
      );

      addTickets(showing.id, nonEmptyTicketUrls)
        .then(() =>
          markAsBought(showing.id, {
            date: showing.date,
            private: showing.private,
            payToUser: showing.payToUser.id,
            location: showing.location.name,
            time: showing.time,
            filmstadenRemoteEntityId: showing.filmstadenRemoteEntityId,
            price: ticketPrice * 100
          })
        )
        .then(() => {
          setState(state => ({
            ...state,
            showModal: false
          }));
        })
        .catch(errors => {
          setState(state => ({
            ...state,
            errors
          }));
        });
    },
    [addTickets, setState, showing, markAsBought, cinemaTicketUrls, ticketPrice]
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
          errors={errors}
          loading={loadingModal}
          setPrice={setPrice}
          setCinemaTicketUrls={setCinemaTicketUrls}
          showing={showing}
          handleMarkBought={handleMarkBought}
          handlePaidChange={handlePaidChange}
          ticketPrice={ticketPrice}
          cinemaTicketUrls={cinemaTicketUrls}
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

(AdminAction as any).fragments = {
  showing: gql`
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
  `
};

export default AdminAction;
