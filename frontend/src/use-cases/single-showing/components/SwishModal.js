import React from "react";
import PropTypes from "prop-types";

import QRCode from "./QRCode";
import Loader from "../../common/utils/ProjectorLoader";
import Modal from "../../common/ui/Modal";

const SwishModal = ({ attendeePaymentDetails, closeSwish }) => {
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

SwishModal.propTypes = {
  payData: PropTypes.object,
  closeSwish: PropTypes.func.isRequired
};

export default SwishModal;
