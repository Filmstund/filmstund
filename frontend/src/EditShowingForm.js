import React from "react";
import { connect } from "react-redux";
import { SingleDatePicker as DatePicker } from "react-dates";
import moment from "moment";
import 'react-dates/lib/css/_datepicker.css';

import { showings as showingActions } from "./store/reducers";

import Header from "./Header";
import Showing from "./Showing";
import Input from "./Input";
import Field from "./Field";
import MainButton, { GrayButton } from "./MainButton";
import { formatTime, formatYMD } from "./lib/dateTools";

const today = moment();

class EditShowingForm extends React.Component {
  constructor(props) {
    super(props);
    const { showing } = props;

    this.state = {
      dateFocused: false,
      showing: {
        id: showing.id,
        expectedBuyDate: moment().add('1 weeks'),
        location: showing.location.name,
        time: formatTime(showing.date),
        price: showing.price !== null ? showing.price : undefined
      }
    };
  }

  setShowingTime = sfTime => {
    this.setState(({ showing }) => ({
      showing: {
        ...showing,
        time: sfTime.localTime,
        location: sfTime.cinema
      }
    }),
      this.handleSubmit
    );
  };

  setShowingDate = value => {
    this.setShowingValue("expectedBuyDate", value);
  };

  setShowingValueFromEvent = (key, { target: { value } }) => {
    return this.setShowingValue(key, value);
  };

  setShowingValue = (key, value, callback = f => f) => {
    this.setState(({ showing }) => ({
      showing: {
        ...showing,
        [key]: value
      }
    }),
      callback
    );
  };

  handleSubmit = () => {
    const submitObject = this.state.showing;

    this.props.updateShowing({
      ...submitObject,
    });
  };

  render() {
    const { showing: { movieId, admin, date } } = this.props;
    const { showing, dateFocused } = this.state;

    return (
      <div>
        <Header>Redigera besök</Header>
        <div>
          <Showing
            date={formatYMD(date) + ' ' + showing.time}
            adminId={admin}
            location={showing.location}
            movieId={movieId}
          />
          <Field text="Förväntat köpdatum:">
            <DatePicker
              numberOfMonths={1}
              focused={dateFocused}
              isOutsideRange={d => d.isAfter(date) || d.isBefore(today)}
              onFocusChange={({ focused }) => this.setState({ dateFocused: focused })}
              date={showing.expectedBuyDate}
              onDateChange={this.setShowingDate}
            />
          </Field>
          <Field text="Visningstid:">
            <Input
              type="time"
              value={showing.time}
              onChange={v => this.setShowingValueFromEvent("time", v)}
            />
          </Field>
          <Field text="Plats:">
            <Input
              type="text"
              value={showing.location}
              onChange={v => this.setShowingValueFromEvent("location", v)}
            />
          </Field>
          <Field text="Pris:">
            <Input
              type="text"
              value={showing.price}
              onChange={v => this.setShowingValueFromEvent("price", v)}
            />
          </Field>
          <MainButton onClick={this.handleSubmit}>Skapa besök</MainButton>
        </div>
      </div>
    );
  }
}


export default connect(null, {
  updateShowing: showingActions.actions.requestUpdate
})(EditShowingForm);