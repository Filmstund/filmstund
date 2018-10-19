import React, { Component } from "react";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import TicketURLInput from "../../use-cases/common/ui/TicketURLInput";
import MainButton from "../../use-cases/common/ui/MainButton";
import Ticket from "./Ticket";
import SeatRange from "./SeatRange";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../../use-cases/common/ui/PageWidthWrapper";
import { ScreenSeats } from "../../use-cases/ticket/ScreenSeats";
import { SmallHeader } from "../../use-cases/common/ui/Header";
import { navigateToShowing } from "../common/navigators/index";

import { FieldWithoutMaxWidth } from "../common/ui/Field";

export default class TicketContainer extends Component {
  state = {
    errors: null,
    success: false,
    cinemaTicketUrls: []
  };

  handleSubmitCinemaTicketUrls = () => {
    const { cinemaTicketUrls } = this.state;
    const {
      data: { showing }
    } = this.props;

    const nonEmptyUrls = cinemaTicketUrls.filter(
      line => line.trim().length !== 0
    );

    this.props
      .addTickets(showing.id, nonEmptyUrls)
      .then(() => {
        this.setState({ success: true, errors: null, cinemaTicketUrls: [] });
      })
      .catch(errors => {
        this.setState({ success: false, errors });
      });
  };

  setCinemaTicketUrls = cinemaTicketUrls => {
    this.setState({
      cinemaTicketUrls
    });
  };

  renderAdminFields = () => {
    const { cinemaTicketUrls } = this.state;

    return (
      <FieldWithoutMaxWidth text="Lägg till SF-bokningslänkar">
        <TicketURLInput
          cinemaTicketUrls={cinemaTicketUrls}
          onChange={this.setCinemaTicketUrls}
        />
        <MainButton onClick={this.handleSubmitCinemaTicketUrls}>
          Skicka
        </MainButton>
      </FieldWithoutMaxWidth>
    );
  };

  handleGoBackToShowing = () => {
    const {
      history,
      data: { showing }
    } = this.props;
    navigateToShowing(history, showing);
  };

  render() {
    const { errors, success } = this.state;
    const {
      data: { me, showing, loading }
    } = this.props;

    const { myTickets, ticketRange, sfSeatMap } = showing;

    if (loading) {
      return <Loader />;
    } else {
      return (
        <PageWidthWrapper>
          <MainButton onClick={this.handleGoBackToShowing}>
            Tillbaka till visning
          </MainButton>
          <SmallHeader>Våra platser:</SmallHeader>
          <SeatRange ticketRange={ticketRange} />
          <ScreenSeats ticketRange={ticketRange} seatMap={sfSeatMap} />
          {myTickets.map(ticket => (
            <Ticket key={ticket.id} {...ticket} />
          ))}
          <StatusMessageBox
            success={success}
            errors={errors}
            successMessage="Uppdaterades!"
          />
          {showing.admin.id === me.id && this.renderAdminFields()}
        </PageWidthWrapper>
      );
    }
  }
}
