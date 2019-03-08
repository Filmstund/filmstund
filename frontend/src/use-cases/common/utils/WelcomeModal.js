import React, { useState, useCallback } from "react";
import { withRouter } from "react-router";
import Modal from "../ui/Modal";

import Header from "../ui/Header";
import MainButton, { ButtonContainer } from "../ui/MainButton";

const WelcomeModal = ({ me: { sfMembershipId }, history }) => {
  const [modalOpen, setModalOpen] = useState(true);

  const navigateToProfile = useCallback(() => {
    setModalOpen(false);
    history.push("/user");
  }, [history]);

  if (sfMembershipId) {
    return null;
  } else {
    return (
      <Modal isOpen={modalOpen}>
        <Header>Välkommen!</Header>

        <p>
          SF har bytt bioklubbsnummer till ett annat format, och det heter
          numera medlemsnummer.
        </p>
        <p>Var god uppdatera ditt registrerade nummer under profilsidan!</p>
        <ButtonContainer>
          <MainButton onClick={navigateToProfile}>
            Gå till profilsidan
          </MainButton>
        </ButtonContainer>
      </Modal>
    );
  }
};

export default withRouter(WelcomeModal);
