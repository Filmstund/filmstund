import React, { Component, lazy } from "react";

import Header from "../common/ui/Header";
import Showing from "../common/showing/Showing";
import Input from "../common/ui/Input";
import Field from "../common/ui/Field";
import MainButton, { RedButton } from "../common/ui/MainButton";
import { formatYMD } from "../../lib/dateTools";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import { navigateToShowing } from "../common/navigators/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { margin } from "../../lib/style-vars";
import addDays from "date-fns/add_days";
import { LocationSelect } from "../common/ui/LocationSelect";

const DatePicker = lazy(() => import("../common/ui/date-picker/DatePicker"));

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
        showing: { movie, admin, date, ticketsBought },
        previousLocations
      }
    } = this.props;
    const { showing, errors } = this.state;

    return (
      <PageWidthWrapper>
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
              value={showing.expectedBuyDate}
              onChange={this.setShowingDate}
              disabledDays={[
                {
                  before: today,
                  after: new Date(date)
                }
              ]}
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
