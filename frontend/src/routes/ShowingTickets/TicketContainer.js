import React, { Component } from "react";
import Loader from "../../ProjectorLoader";
import TicketURLInput from "../../TicketURLInput";
import Field from "../../Field";
import MainButton from "../../MainButton";
import Ticket from "./Ticket";
import SeatRange from "./SeatRange";
import StatusMessageBox from "../../StatusMessageBox";
import { ScreenSeats } from "../../ScreenSeats";
import { SmallHeader } from "../../Header";
import { navigateToShowing } from "../../navigators/index";

export default class TicketContainer extends Component {
  state = {
    errors: null,
    success: false,
    cinemaTicketUrls: []
  };

  handleSubmitCinemaTicketUrls = () => {
    const { cinemaTicketUrls } = this.state;

    const nonEmptyUrls = cinemaTicketUrls.filter(
      line => line.trim().length !== 0
    );

    this.props
      .addTickets(nonEmptyUrls)
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
      <Field text="Lägg till SF-biljettlänkar">
        <TicketURLInput
          cinemaTicketUrls={cinemaTicketUrls}
          onChange={this.setCinemaTicketUrls}
        />
        <MainButton onClick={this.handleSubmitCinemaTicketUrls}>
          Skicka
        </MainButton>
      </Field>
    );
  };

  handleGoBackToShowing = () => {
    const { history, data: { showing } } = this.props;
    navigateToShowing(history, showing);
  };

  render() {
    const { errors, success } = this.state;
    const { data: { me, showing, loading } } = this.props;

    const { myTickets, ticketRange, sfSeatMap } = showing;

    if (loading) {
      return <Loader />;
    } else {
      return (
        <div>
          <MainButton onClick={this.handleGoBackToShowing}>
            Tillbaka till visning
          </MainButton>
          <SmallHeader>Våra platser:</SmallHeader>
          <SeatRange ticketRange={ticketRange} />
          <ScreenSeats ticketRange={ticketRange} seatMap={sfSeatMap} />
          {myTickets.map(ticket => <Ticket key={ticket.id} {...ticket} />)}
          <StatusMessageBox
            success={success}
            errors={errors}
            successMessage="Uppdaterades!"
          />
          {showing.admin.id === me.id && this.renderAdminFields()}
        </div>
      );
    }
  }
}
