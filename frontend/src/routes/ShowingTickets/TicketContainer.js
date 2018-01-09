import React, { Component } from "react";
import { jsonRequest } from "../../lib/fetch";
import { withBaseURL } from "../../lib/withBaseURL";
import Loader from "../../ProjectorLoader";
import TicketURLInput from "../../TicketURLInput";
import Field from "../../Field";
import MainButton from "../../MainButton";
import Ticket from "./Ticket";
import _ from "lodash";
import SeatRange from "./SeatRange";

export default class TicketContainer extends Component {
  state = {
    error: null,
    cinemaTicketUrls: []
  };

  handleSubmitCinemaTicketUrls = () => {
    const { cinemaTicketUrls } = this.state;
    const { showing } = this.props;

    const nonEmptyUrls = cinemaTicketUrls.filter(
      line => line.trim().length !== 0
    );

    jsonRequest(withBaseURL(`/tickets/${showing.id}`), nonEmptyUrls).then(
      tickets => {
        this.setState({
          tickets,
          cinemaTicketUrls: []
        });
      }
    );
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
    const { showingId } = this.props;
    this.props.history.push(`/showings/${showingId}`);
  };

  render() {
    const { error } = this.state;
    const { data: { me, showing, loading }, navigateToShowing } = this.props;

    const { myTickets } = showing;
    const range = _.groupBy(myTickets.map(t => t.seat), "row");

    if (error) {
      return (
        <div>
          <MainButton onClick={navigateToShowing}>
            Tillbaka till visning
          </MainButton>
          <div>{error}</div>
        </div>
      );
    } else if (loading) {
      return <Loader />;
    } else {
      return (
        <div>
          <MainButton onClick={navigateToShowing}>
            Tillbaka till visning
          </MainButton>
          <SeatRange range={range} />
          {myTickets.map(ticket => <Ticket key={ticket.id} {...ticket} />)}
          {showing.admin.id === me.id && this.renderAdminFields()}
        </div>
      );
    }
  }
}
