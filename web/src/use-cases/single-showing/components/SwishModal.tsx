import React from "react";

import { QRCode } from "./QRCode";
import Loader from "../../common/utils/ProjectorLoader";
import Modal from "../../common/ui/Modal";

interface SwishModalProps {
  swishLink: string | null | undefined;
  closeSwish: () => void;
}

export const SwishModal: React.VFC<SwishModalProps> = ({
  swishLink,
  closeSwish,
}) => {
  if (!swishLink) {
    return <Loader />;
  }

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
