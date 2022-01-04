import React, { useCallback, useState } from "react";
import Modal from "../ui/Modal";

import Header from "../ui/Header";
import MainButton, { ButtonContainer } from "../ui/MainButton";
import { User } from "../../../__generated__/types";
import { useNavigate } from "react-router-dom";

interface Props {
  me: User;
}

export const WelcomeModal: React.FC<Props> = ({
  me: { filmstadenMembershipID },
}) => {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(true);

  const navigateToProfile = useCallback(() => {
    setModalOpen(false);
    navigate("/user");
  }, [navigate]);

  if (filmstadenMembershipID) {
    return null;
  } else {
    return (
      <Modal isOpen={modalOpen}>
        <Header>Välkommen!</Header>

        <p>
          Filmstaden har bytt bioklubbsnummer till ett annat format, och det
          heter numera medlemsnummer.
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
