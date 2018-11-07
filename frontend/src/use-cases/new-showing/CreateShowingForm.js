import React, { lazy } from "react";
import { graphql } from "react-apollo";
import { branch, renderComponent, compose, withState } from "recompose";
import gql from "graphql-tag";
import { wrapMutate } from "../../store/apollo";
import { keys, groupBy } from "lodash-es";

import Header, { SmallHeader } from "../common/ui/Header";
import Showing, {
  movieFragment,
  showingFragment
} from "../common/showing/Showing";
import Input from "../common/ui/Input";
import Field from "../common/ui/Field";
import MainButton, { GrayButton } from "../common/ui/MainButton";
import { formatYMD, formatLocalTime } from "../../lib/dateTools";
import SelectBox from "../common/ui/SelectBox";
import Loader from "../common/utils/ProjectorLoader";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import format from "date-fns/format";
import isAfter from "date-fns/is_after";
import { LocationSelect } from "../common/ui/LocationSelect";

const DatePicker = lazy(() => import("../common/ui/date-picker/DatePicker"));

const now = new Date();

class CreateShowingForm extends React.Component {
  constructor(props) {
    super(props);

    const {
      data: { me, movie },
      movieId
    } = props;

    let date = now;

    if (isAfter(movie.releaseDate, now)) {
      date = new Date(movie.releaseDate);
    }

    this.state = {
      showing: {
        date,
        time: format(now, "HH:mm"),
        location: "",
        sfScreen: null,
        movieId: movieId,
        admin: me.id
      },
      selectedDate: formatYMD(date)
    };
  }

  setShowingDate = value => {
    this.setShowingValue("date", value);
    this.setState({ selectedDate: formatYMD(value) });
  };

  setShowingTime = sfTime => {
    const {
      timeUtc,
      cinemaName,
      screen: { name, sfId }
    } = sfTime;

    this.setState(
      state => ({
        showing: {
          ...state.showing,
          time: formatLocalTime(timeUtc),
          location: cinemaName,
          sfScreen: { name, sfId }
        }
      }),
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
    const {
      showing: { time, date, location, sfScreen }
    } = this.state;
    const { movieId } = this.props;

    const showing = {
      time,
      movieId,
      date: formatYMD(date),
      sfScreen,
      location
    };

    this.props
      .createShowing(showing)
      .then(resp => {
        const { showing } = resp.data;
        this.props.navigateToShowing(showing);
      })
      .catch(errors => {
        console.log(errors);
      });
  };

  renderSelectSfTime = (sfTimes, showing) => {
    if (!sfTimes || sfTimes.length === 0) {
      return <div>Inga tider från SF för {formatYMD(showing.date)}</div>;
    } else {
      return (
        <div>
          <SmallHeader>Välj tid från SF</SmallHeader>
          <Field text="Tid:">
            <SelectBox options={sfTimes} onChange={this.setShowingTime} />
          </Field>
        </div>
      );
    }
  };

  getSfDates = () => {
    const {
      data: {
        movie: { sfShowings }
      }
    } = this.props;

    return groupBy(sfShowings, s => formatYMD(s.timeUtc));
  };

  render() {
    const { showing, selectedDate } = this.state;
    const {
      clearSelectedMovie,
      data: { movie, sfCities, previousLocations },
      setCity,
      city
    } = this.props;

    const sfdates = this.getSfDates();

    const locationName = showing.location;

    return (
      <PageWidthWrapper>
        <Header>Skapa besök</Header>
        <div>
          <Showing
            date={showing.date}
            adminId={showing.admin}
            location={locationName}
            movie={movie}
          />
          <Field text="SF-stad (används för att hämta rätt tider):">
            <select
              value={city}
              onChange={({ target: { value } }) => setCity(value)}
            >
              {sfCities.map(city => (
                <option key={city.alias} value={city.alias}>
                  {city.name}
                </option>
              ))}
            </select>
          </Field>
          <Field text="Datum:">
            <DatePicker
              value={showing.date}
              onChange={this.setShowingDate}
              disabledDays={{ before: now }}
              modifiers={{ sfdays: keys(sfdates).map(s => new Date(s)) }}
              modifiersStyles={{
                sfdays: {
                  backgroundColor: "#fff",
                  borderColor: "#d0021b",
                  color: "#d0021b"
                }
              }}
            />
          </Field>
          {this.renderSelectSfTime(sfdates[selectedDate], showing)}
          <SmallHeader>...eller skapa egen tid</SmallHeader>
          <Field text="Tid:">
            <Input
              type="time"
              value={showing.time}
              onChange={v => this.setShowingValueFromEvent("time", v)}
            />
          </Field>
          <Field text="Plats:">
            <LocationSelect
              previousLocations={previousLocations}
              value={locationName}
              onChange={value => this.setShowingValue("location", value)}
            />
          </Field>
          <GrayButton onClick={clearSelectedMovie}>Avbryt</GrayButton>
          <MainButton onClick={this.handleSubmit}>Skapa besök</MainButton>
        </div>
      </PageWidthWrapper>
    );
  }
}

const data = graphql(
  gql`
    query CreateShowingQuery($movieId: UUID!, $city: String) {
      movie(id: $movieId) {
        ...ShowingMovie
        releaseDate
        sfShowings(city: $city) {
          cinemaName
          screen {
            sfId
            name
          }
          timeUtc
          tags
        }
      }
      me: currentUser {
        id
        nick
      }
      previousLocations {
        name
      }
      sfCities {
        name
        alias
      }
    }
    ${movieFragment}
  `,
  {
    options: {
      fetchPolicy: "cache-and-network"
    }
  }
);

const mutation = graphql(
  gql`
    mutation CreateShowing($showing: CreateShowingInput!) {
      showing: createShowing(showing: $showing) {
        ...OldShowing
      }
    }
    ${showingFragment}
  `,
  {
    props: ({ mutate }) => ({
      createShowing: showing => wrapMutate(mutate, { showing })
    })
  }
);

const withCityState = withState("city", "setCity", "GB");

const isLoading = branch(({ data: { me } }) => !me, renderComponent(Loader));

export default compose(
  withCityState,
  mutation,
  data,
  isLoading
)(CreateShowingForm);
