import React from "react";
import PropTypes from "prop-types";

import QRCode from "./QRCode";
import Loader from "../../ProjectorLoader";
import Modal from "./Modal";

const SwishModal = ({ payData, closeSwish }) => {
  if (!payData) {
    return <Loader />;
  }
  // const { amountOwed, swishLink, hasPaid, payTo } = payData

  const { swishLink } = payData;

  if (swishLink) {
    return (
      <Modal>
        <button onClick={closeSwish}>Stäng</button>
        <QRCode value={swishLink} width={"25em"} height={"25em"} />
      </Modal>
    );
  }
};

SwishModal.propTypes = {
  payData: PropTypes.object,
  closeSwish: PropTypes.func.isRequired
};

export default SwishModal;
