import React, { Component } from "react";
import { getJson, jsonRequest } from "../../lib/fetch";
import { withBaseURL } from "../../lib/withBaseURL";
import Loader from "../../ProjectorLoader";
import TicketURLInput from "../../TicketURLInput";
import Field from "../../Field";
import MainButton from "../../MainButton";
import Ticket from "./Ticket";
import RangeDisplay from "./RangeDisplay";

export default class TicketContainer extends Component {
  state = {
    tickets: null,
    error: null,
    range: null,
    cinemaTicketUrls: []
  };

  componentWillMount() {
    getJson(`/tickets/${this.props.showingId}/seating-range`).then(range => {
      this.setState({ range });
    });
    getJson(`/tickets/${this.props.showingId}`).then(
      tickets => {
        this.setState({ tickets });
      },
      err => {
        this.setState({
          error: "Ingen biljett registrerad för köpet"
        });
      }
    );
  }

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
    this.props.history.goBack();
  };

  render() {
    const { range, tickets, error } = this.state;
    const { me, showing } = this.props;

    if (error) {
      return (
        <div>
          <MainButton onClick={this.handleGoBackToShowing}>
            Tillbaka till visning
          </MainButton>
          <div>{error}</div>
        </div>
      );
    } else if (!tickets) {
      return <Loader />;
    } else {
      return (
        <div>
          <MainButton onClick={this.handleGoBackToShowing}>
            Tillbaka till visning
          </MainButton>
          {range && <RangeDisplay range={range} />}
          {tickets.map(ticket => <Ticket key={ticket.id} {...ticket} />)}
          {showing.admin === me.id && this.renderAdminFields()}
        </div>
      );
    }
  }
}
