import React from "react";
import PropTypes from "prop-types";

import QRCode from "./QRCode";
import Loader from "../../ProjectorLoader";
import Modal from "../../Modal";

const SwishModal = ({ attendeePaymentDetails, closeSwish }) => {
  if (!attendeePaymentDetails) {
    return <Loader />;
  }

  const { swishLink } = attendeePaymentDetails;

  if (swishLink) {
    return (
      <Modal>
        <button onClick={closeSwish}>Stäng</button>
        <QRCode data={swishLink} />
      </Modal>
    );
  }
};

SwishModal.propTypes = {
  payData: PropTypes.object,
  closeSwish: PropTypes.func.isRequired
};

export default SwishModal;
