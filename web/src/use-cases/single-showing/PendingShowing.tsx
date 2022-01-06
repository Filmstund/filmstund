import React, { ChangeEvent, useMemo, useState } from "react";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import Modal from "../common/ui/Modal";

import { SmallHeader } from "../common/ui/Header";
import { useStateWithHandleChange } from "../common/utils/useStateWithHandleChange";
import {
  GiftCertificateFragment,
  useAttendShowingMutation,
  useUnattendShowingMutation,
} from "../../__generated__/types";

import {
  createPaymentOptions,
  DisplayPaymentOption,
  stringifyOption,
} from "./utils/createPaymentOptions";

interface Props {
  showingId: string;
  isParticipating: boolean;
  foretagsbiljetter: GiftCertificateFragment[];
}

export const PendingShowing: React.FC<Props> = ({
  showingId,
  isParticipating,
  foretagsbiljetter,
}) => {
  const [selectedIndex, handleSelectIndex] = useStateWithHandleChange(0);
  const [modalOpen, setModalOpen] = useState(false);

  const paymentOptions = useMemo(
    () => createPaymentOptions(foretagsbiljetter),
    [foretagsbiljetter]
  );

  const [, attendShowing] = useAttendShowingMutation();
  const [, unattendShowing] = useUnattendShowingMutation();

  const attendWithPaymentOption = (paymentOption: DisplayPaymentOption) => {
    const { type, ticketNumber } = paymentOption;

    attendShowing({ showingId, paymentOption: { type, ticketNumber } }).then(
      () => setModalOpen(false)
    );
  };

  const handleClickSelectPaymentOption = () => {
    attendWithPaymentOption(paymentOptions[selectedIndex]);
  };

  const handleClickAttend = () => {
    if (paymentOptions.length > 1) {
      setModalOpen(true);
    } else {
      // Attend with Swish option
      attendWithPaymentOption(paymentOptions[0]);
    }
  };

  return (
    <>
      {modalOpen && (
        <ModalPaymentOptions
          selectedIndex={selectedIndex}
          setPaymentOption={handleSelectIndex}
          paymentOptions={paymentOptions}
          setModalOpen={setModalOpen}
          handleClickSelectPaymentOption={handleClickSelectPaymentOption}
        />
      )}
      {isParticipating ? (
        <GrayButton onClick={() => unattendShowing({ showingId })}>
          Avanmäl
        </GrayButton>
      ) : (
        <MainButton onClick={handleClickAttend}>Jag hänger på!</MainButton>
      )}
    </>
  );
};

interface ModalPaymentOptionsProps {
  selectedIndex: number;
  paymentOptions: DisplayPaymentOption[];
  setModalOpen: (v: boolean) => void;
  handleClickSelectPaymentOption: () => void;
  setPaymentOption: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const ModalPaymentOptions: React.FC<ModalPaymentOptionsProps> = ({
  selectedIndex,
  paymentOptions,
  setModalOpen,
  handleClickSelectPaymentOption,
  setPaymentOption,
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
