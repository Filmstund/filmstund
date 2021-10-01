import React from "react";

import { QRCode } from "./QRCode";
import Loader from "../../common/utils/ProjectorLoader";
import Modal from "../../common/ui/Modal";
import { SingleShowing_showing_attendeePaymentDetails } from "../containers/__generated__/SingleShowing";

interface SwishModalProps {
  attendeePaymentDetails: SingleShowing_showing_attendeePaymentDetails | null;
  closeSwish: () => void;
}

export const SwishModal: React.VFC<SwishModalProps> = ({
  attendeePaymentDetails,
  closeSwish,
}) => {
  if (!attendeePaymentDetails) {
    return <Loader />;
  }

  const { swishLink } = attendeePaymentDetails;

  return (
    <Modal>
      <button onClick={closeSwish}>Stäng</button>
      {swishLink ? (
        <QRCode value={swishLink} width="25em" height="25em" />
      ) : (
        "Något gick fel... (swishLink === null)"
      )}
    </Modal>
  );
};
