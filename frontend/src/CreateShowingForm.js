import React from "react";
import { connect } from "react-redux";
import { SingleDatePicker as DatePicker } from "react-dates";
import moment from "moment";
import 'react-dates/lib/css/_datepicker.css';

import { showings } from "./store/reducers";

import Header from "./Header";
import Showing from "./Showing";
import Input from "./Input";
import Field from "./Field";
import MainButton, { GrayButton } from "./MainButton";
import { getJson } from "./lib/fetch";
import { formatYMD } from "./lib/dateTools";
import SelectBox from "./SelectBox";

class NewShowing extends React.Component {
  constructor(props) {
    super(props);
    const now = moment();

    this.state = {
      dateFocused: false,
      showing: {
        date: now,
        time: now.format("HH:mm"),
        location: "",
        price: "",
        movieId: this.props.movieId,
        admin: this.props.me.id
      },
      sfTimes: [],
      datesForMovieId: []
    };
  }

  componentWillMount() {
    this.requestDatesForMovie(this.props.movieId);
  }

  setShowingDate = value => {
    this.setShowingValue("date", value, this.requestSFTimes);
  };

  setShowingCity = ({ target: { value } }) => {
    this.requestSFTimes();
    // this.setShowingValue("city", value, )
  };

  requestDatesForMovie = movieId => {
    const url = `/movies/${movieId}/sfdates`;

    getJson(url).then(data => {
      const dates = data.map(formatYMD);

      this.setState(
        {
          datesForMovieId: dates
        },
        this.requestSFTimes
      );
    });
  };

  requestSFTimes = () => {
    const { datesForMovieId, showing: { movieId, date } } = this.state;

    if (!datesForMovieId.includes(formatYMD(date))) {
      this.setState({
        sfTimes: []
      });

      return;
    }

    const url = `/movies/${movieId}/sfdates/${formatYMD(date)}`;

    getJson(url).then(data => {
      const sfTimes = data.map(d => {
        return {
          ...d,
          localTime: moment(formatYMD(date) + " " + d.localTime).format("HH:mm")
        };
      });
      this.setState({ sfTimes });
    });
  };

  setShowingTime = sfTime => {
    this.setState(
      {
        showing: {
          ...this.state.showing,
          time: sfTime.localTime,
          location: sfTime.cinema
        }
      },
      this.handleSubmit
    );
  };

  setShowingValueFromEvent = (key, { target: { value } }) => {
    return this.setShowingValue(key, value);
  };

  setShowingValue = (key, value, callback = f => f) => {
    this.setState(
      {
        showing: {
          ...this.state.showing,
          [key]: value
        }
      },
      callback
    );
  };

  handleSubmit = () => {
    const submitObject = {
      ...this.state.showing,
      price: parseFloat(this.state.showing.price, 10) * 100,
      date: formatYMD(this.state.showing.date)
    };

    this.props.dispatch(showings.actions.requestCreate(submitObject));
  };

  renderSelectSfTime = (sfTimes, showing) => {
    if (sfTimes.length === 0) {
      return (
        <div>
          Inga tider från SF för {formatYMD(showing.date)}
        </div>
      );
    } else {
      return (
        <div>
          <Header>Välj tid från SF</Header>
          <Field text="SF-stad (används för att hämta rätt tider):">
            <Input
              type="text"
              value="Göteborg"
              disabled={true}
              onChange={v => this.setShowingCity(v)}
            />
          </Field>
          <Field text="Tid:">
            <SelectBox
              options={sfTimes}
              onChange={v => this.setShowingTime(v)}
            />
          </Field>
        </div>
      );
    }
  };

  render() {
    const { showing, sfTimes, dateFocused } = this.state;
    const { movieId, clearSelectedMovie } = this.props;

    return (
      <div>
        <Header>Skapa besök</Header>
        <div>
          <Showing
            date={showing.date}
            adminId={showing.admin}
            location={showing.location}
            movieId={movieId}
          />
          <Field text="Datum:">
            <DatePicker
              numberOfMonths={1}
              focused={dateFocused}
              onFocusChange={({ focused }) => this.setState({ dateFocused: focused })}
              date={showing.date}
              onDateChange={this.setShowingDate}
            />
          </Field>
          {this.renderSelectSfTime(sfTimes, showing)}
          <Header>...eller skapa egen tid</Header>
          <Field text="Tid:">
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
          <GrayButton onClick={clearSelectedMovie}>Avbryt</GrayButton>
          <MainButton onClick={this.handleSubmit}>Skapa besök</MainButton>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  me: state.me.data
}))(NewShowing);
