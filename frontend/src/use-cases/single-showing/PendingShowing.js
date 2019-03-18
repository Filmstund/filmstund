import React, { useState, useMemo, useCallback } from "react";
import gql from "graphql-tag";

import { SmallHeader } from "../../use-cases/common/ui/Header";
import MainButton, { GrayButton } from "../../use-cases/common/ui/MainButton";
import Modal from "../../use-cases/common/ui/Modal";

import createPaymentOptions, {
  stringifyOption
} from "./utils/createPaymentOptions";
import { useStateWithHandleChange } from "../common/utils/useStateWithHandleChange";
import {
  useAttendShowing,
  useUnattendShowing
} from "../../apollo/mutations/showings/useAttendShowing";

export const PendingShowing = ({ isParticipating, foretagsbiljetter }) => {
  const [selectedIndex, handleSelectIndex] = useStateWithHandleChange(0);
  const [modalOpen, setModalOpen] = useState(false);

  const paymentOptions = useMemo(
    () => createPaymentOptions(foretagsbiljetter),
    [foretagsbiljetter]
  );

  const attendShowing = useAttendShowing();
  const unattendShowing = useUnattendShowing();

  const attendWithPaymentOption = useCallback(
    paymentOption => {
      const { type, ticketNumber } = paymentOption;

      attendShowing({ paymentOption: { type, ticketNumber } }).then(() =>
        setModalOpen(false)
      );
    },
    [attendShowing]
  );

  const handleClickSelectPaymentOption = useCallback(() => {
    attendWithPaymentOption(paymentOptions[selectedIndex]);
  }, [attendWithPaymentOption, paymentOptions, selectedIndex]);

  const handleClickAttend = useCallback(() => {
    if (paymentOptions.length > 1) {
      setModalOpen(true);
    } else {
      // Attend with Swish option
      attendWithPaymentOption(paymentOptions[0]);
    }
  }, [attendWithPaymentOption, paymentOptions]);

  return (
    <>
      {modalOpen && (
        <ModalPaymentOptions
          setPaymentOption={handleSelectIndex}
          paymentOptions={paymentOptions}
          setModalOpen={setModalOpen}
          handleClickSelectPaymentOption={handleClickSelectPaymentOption}
        />
      )}
      {isParticipating ? (
        <GrayButton onClick={unattendShowing}>Avanmäl</GrayButton>
      ) : (
        <MainButton onClick={handleClickAttend}>Jag hänger på!</MainButton>
      )}
    </>
  );
};

const ModalPaymentOptions = ({
  selectedIndex,
  paymentOptions,
  setModalOpen,
  handleClickSelectPaymentOption,
  setPaymentOption
}) => {
  return (
    <Modal onRequestClose={() => setModalOpen(false)}>
      <SmallHeader>Betalningsalternativ</SmallHeader>
      <select
        name="betalningsalternativ"
        value={selectedIndex}
        onChange={setPaymentOption}
      >
        {paymentOptions.map((option, index) => (
          <option key={index} value={index}>
            {stringifyOption(option)}
          </option>
        ))}
      </select>
      <MainButton onClick={handleClickSelectPaymentOption}>
        Jag hänger på!
      </MainButton>
    </Modal>
  );
};

PendingShowing.fragments = {
  currentUser: gql`
    fragment PendingShowing on CurrentUser {
      foretagsbiljetter {
        expires
        number
        status
      }
    }
  `
};
