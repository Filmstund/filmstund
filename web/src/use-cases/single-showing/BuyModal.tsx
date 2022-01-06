import styled from "@emotion/styled";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import Center from "../../use-cases/common/ui/Center";

import Modal from "../common/ui/Modal";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import { AdminModalAfterTicketsBought } from "./AdminModalAfterTicketsBought";
import { AdminModalBeforeTicketsBought } from "./AdminModalBeforeTicketsBought";
import { SingleShowingScreenShowing } from "./containers/types";

const Padding = styled.div`
  padding: 0 1em;
`;

const Close = styled.div`
  position: absolute;
  display: inline;
  font-size: 2em;
  right: 1em;
  top: 0.8em;
  cursor: pointer;
`;

interface BuyModalProps {
  loading: boolean;
  closeModal: () => void;
  showing: SingleShowingScreenShowing;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  loading,
  closeModal,
  showing,
}) => {
  if (loading || !showing.adminPaymentDetails) {
    return (
      <Modal>
        <Center>
          <Loader />
        </Center>
      </Modal>
    );
  }

  return (
    <Modal>
      <Padding>
        <Close onClick={closeModal}>
          <FontAwesomeIcon icon={faTimes} />
        </Close>
        <Padding>
          {showing.ticketsBought && (
            <AdminModalAfterTicketsBought
              participantPaymentInfos={showing.adminPaymentDetails.attendees}
              showingId={showing.id}
            />
          )}
          {!showing.ticketsBought && (
            <AdminModalBeforeTicketsBought
              closeModal={closeModal}
              showing={showing}
              adminPaymentDetails={showing.adminPaymentDetails}
            />
          )}
        </Padding>
      </Padding>
    </Modal>
  );
};
