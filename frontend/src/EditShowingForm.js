import React, { Component } from "react";
import { SingleDatePicker as DatePicker } from "react-dates";
import moment from "moment";
import "react-dates/lib/css/_datepicker.css";

import Header from "./Header";
import Showing from "./Showing";
import Input from "./Input";
import Field from "./Field";
import MainButton from "./MainButton";
import { formatYMD } from "./lib/dateTools";
import StatusMessageBox from "./StatusMessageBox";
import { navigateToShowing } from "./navigators/index";

const today = moment();

class EditShowingForm extends Component {
  constructor(props) {
    super(props);
    const { showing } = props.data;

    this.state = {
      errors: null,
      dateFocused: false,
      showing: {
        expectedBuyDate: today.add("1 weeks"),
        location: showing.location.name,
        time: showing.time,
        price: showing.price !== null ? showing.price / 100 : ""
      }
    };
  }

  setShowingTime = sfTime => {
    this.setState(
      ({ showing }) => ({
        showing: {
          ...showing,
          time: sfTime.localTime,
          location: sfTime.cinemaName
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
    this.setState(
      ({ showing }) => ({
        showing: {
          ...showing,
          [key]: value
        }
      }),
      callback
    );
  };

  navigateToShowing = () => {
    const { history, data: { showing } } = this.props;
    navigateToShowing(history, showing);
  };

  handleSubmit = () => {
    const { showing: newValues } = this.state;
    const { data: { showing } } = this.props;

    this.props
      .updateShowing(showing.id, {
        expectedBuyDate: formatYMD(newValues.expectedBuyDate),
        private: showing.private,
        payToUser: showing.payToUser.id,
        location: newValues.location,
        time: newValues.time,
        price: (parseInt(newValues.price, 10) || 0) * 100
      })
      .then(this.navigateToShowing)
      .catch(errors => {
        this.setState({ errors });
      });
  };

  render() {
    const { data: { showing: { movie, admin, date } } } = this.props;
    const { showing, dateFocused, errors } = this.state;

    return (
      <div>
        <Header>Redigera besök</Header>
        <div>
          <Showing
            date={formatYMD(date) + " " + showing.time}
            admin={admin}
            location={showing.location}
            movie={movie}
          />
          <StatusMessageBox errors={errors} />
          <Field text="Förväntat köpdatum:">
            <DatePicker
              numberOfMonths={1}
              focused={dateFocused}
              isOutsideRange={d => d.isAfter(date) || d.isBefore(today)}
              onFocusChange={({ focused }) =>
                this.setState({ dateFocused: focused })
              }
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
          <MainButton onClick={this.handleSubmit}>Uppdatera besök</MainButton>
        </div>
      </div>
    );
  }
}

export default EditShowingForm;
