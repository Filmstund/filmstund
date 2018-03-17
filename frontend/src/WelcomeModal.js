import React, { Component } from "react";
import { withRouter } from "react-router";
import Modal from "./Modal";

import Header from "./Header";
import MainButton, { ButtonContainer } from "./MainButton";

class WelcomeModal extends Component {
  state = {
    modalOpen: true
  };

  navigateToProfile = () => {
    this.setState(
      {
        modalOpen: false
      },
      () => {
        this.props.history.push("/user");
      }
    );
  };

  render() {
    const { me: { sfMembershipId } } = this.props;
    const { modalOpen } = this.state;

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
            <MainButton onClick={this.navigateToProfile}>
              Gå till profilsidan
            </MainButton>
          </ButtonContainer>
        </Modal>
      );
    }
  }
}

export default withRouter(WelcomeModal);
