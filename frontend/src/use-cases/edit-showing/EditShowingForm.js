import React, { Component } from "react";

import Header from "../common/ui/Header";
import Showing from "../common/showing/Showing";
import Input from "../common/ui/Input";
import Field from "../common/ui/Field";
import MainButton, { RedButton } from "../common/ui/MainButton";
import { formatLocalTime, formatYMD } from "../../lib/dateTools";
import StatusMessageBox, { StatusBox } from "../common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import { navigateToShowing } from "../common/navigators/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faTrash from "@fortawesome/fontawesome-free-solid/faTrash";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";
import styled from "styled-components";
import { margin } from "../../lib/style-vars";
import addDays from "date-fns/add_days";
import parse from "date-fns/parse";
import Loadable from "react-loadable";
import { LocationSelect } from "../common/ui/LocationSelect";
import { SfShowingSelector } from "../common/showing/SfShowingSelector";
import { Query } from "react-apollo";
import { fetchSfShowings } from "../../apollo/queries/sfShowings";

const DatePickerInput = Loadable({
  loader: () => import("../common/ui/date-picker/DatePickerInput"),
  loading: () => null
});

const today = new Date();

const FaIcon = styled(FontAwesomeIcon)`
  margin-right: ${margin};
`;

class EditShowingForm extends Component {
  constructor(props) {
    super(props);
    const { showing } = props.data;

    this.state = {
      errors: null,
      dateFocused: false,
      showing: {
        expectedBuyDate: addDays(today, 7),
        date: parse(showing.date),
        location: showing.location.name,
        time: showing.time,
        price: showing.price !== null ? showing.price / 100 : ""
      }
    };
  }

  setShowingTime = sfTime => {
    this.setState(({ showing }) => ({
      showing: {
        ...showing,
        time: formatLocalTime(sfTime.timeUtc),
        location: sfTime.cinemaName
      }
    }));
  };

  setShowingDate = value => {
    this.setShowingValue("date", value);
  };

  setExpectedShowingDate = value => {
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
    const {
      history,
      data: { showing }
    } = this.props;
    navigateToShowing(history, showing);
  };

  handleSubmit = () => {
    const { showing: newValues } = this.state;
    const {
      data: { showing }
    } = this.props;

    this.props
      .updateShowing(showing.id, {
        date: formatYMD(newValues.date),
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

  handleDelete = () => {
    const proceed = window.confirm("Är du säker? Går ej att ångra!");
    const {
      data: { showing }
    } = this.props;

    if (proceed) {
      this.props.deleteShowing(showing.id).then(() => {
        this.props.history.push("/showings");
      });
    }
  };

  render() {
    const {
      data: {
        showing: { movie, admin, date, ticketsBought, location },
        previousLocations
      }
    } = this.props;
    const { showing, errors } = this.state;

    return (
      <PageWidthWrapper>
        <Header>Redigera besök</Header>
        <div>
          <Showing
            date={formatYMD(showing.date) + " " + showing.time}
            admin={admin}
            location={showing.location}
            movie={movie}
          />
          <StatusMessageBox errors={errors} />
          {date !== formatYMD(showing.date) && (
            <StatusBox>
              Du har ändrat datum! Om du sparar denna ändring kommer alla
              anmälda meddelas.
            </StatusBox>
          )}
          <Query
            query={fetchSfShowings}
            variables={{ movieId: movie.id, city: location.cityAlias }}
          >
            {({
              data: {
                movie: { sfShowings }
              }
            }) => (
              <SfShowingSelector
                sfShowings={sfShowings}
                onChangeTime={this.setShowingTime}
                onChangeDate={this.setShowingDate}
                showing={showing}
                selectedDate={showing.date}
              />
            )}
          </Query>
          <Field text="Visningstid:">
            <Input
              type="time"
              value={showing.time}
              onChange={v => this.setShowingValueFromEvent("time", v)}
            />
          </Field>
          <Field text="Förväntat köpdatum:">
            <DatePickerInput
              value={showing.expectedBuyDate}
              onChange={this.setExpectedShowingDate}
              disabledDays={[
                {
                  before: today,
                  after: parse(showing.date)
                }
              ]}
            />
          </Field>
          <Field text="Plats:">
            <LocationSelect
              previousLocations={previousLocations}
              value={showing.location}
              onChange={value => this.setShowingValue("location", value)}
            />
          </Field>
          <Field text="Pris:">
            <Input
              type="text"
              value={showing.price}
              onChange={v => this.setShowingValueFromEvent("price", v)}
            />
          </Field>
          {!ticketsBought && (
            <RedButton onClick={this.handleDelete}>
              <FaIcon icon={faTrash} /> Ta bort besök
            </RedButton>
          )}
          <MainButton onClick={this.handleSubmit}>
            <FaIcon icon={faEdit} /> Uppdatera besök
          </MainButton>
        </div>
      </PageWidthWrapper>
    );
  }
}

export default EditShowingForm;
