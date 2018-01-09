import React, { Component } from "react";
import Loader from "../../ProjectorLoader";
import TicketURLInput from "../../TicketURLInput";
import Field from "../../Field";
import MainButton from "../../MainButton";
import Ticket from "./Ticket";
import _ from "lodash";
import SeatRange from "./SeatRange";
import StatusBox from "../../StatusBox";

export default class TicketContainer extends Component {
  state = {
    errors: null,
    cinemaTicketUrls: []
  };

  handleSubmitCinemaTicketUrls = () => {
    const { cinemaTicketUrls } = this.state;

    const nonEmptyUrls = cinemaTicketUrls.filter(
      line => line.trim().length !== 0
    );

    this.props
      .addTickets(nonEmptyUrls)
      .then(() => {})
      .catch(errors => {
        this.setState({ errors });
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
    const { showingId } = this.props;
    this.props.history.push(`/showings/${showingId}`);
  };

  render() {
    const { errors } = this.state;
    const { data: { me, showing, loading }, navigateToShowing } = this.props;

    const { myTickets } = showing;
    const range = _.groupBy(myTickets.map(t => t.seat), "row");

    if (loading) {
      return <Loader />;
    } else {
      return (
        <div>
          <MainButton onClick={navigateToShowing}>
            Tillbaka till visning
          </MainButton>
          <SeatRange range={range} />
          {myTickets.map(ticket => <Ticket key={ticket.id} {...ticket} />)}
          {errors && (
            <StatusBox error>{errors.map(e => e.message).join(", ")}</StatusBox>
          )}
          {showing.admin.id === me.id && this.renderAdminFields()}
        </div>
      );
    }
  }
}
