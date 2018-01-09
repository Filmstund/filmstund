import React, { Component } from "react";
import moment from "moment";
import styled from "styled-components";
import MainButton from "../../MainButton";

import { SingleDatePicker as DatePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import Field from "../../Field";
import { SmallHeader } from "../../Header";
import Input from "../../Input";

import { formatYMD } from "../../lib/dateTools";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { wrapMutate } from "../../store/apollo";
import StatusMessageBox from "../../StatusMessageBox";

const DEFAULT_DATE = moment().add(1, "years");

const ForetagsbiljettWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
`;

const ForetagsbiljettInput = styled(Input)`
  max-width: 13.6em;
  background: ${props => (props.disabled ? "rgba(0, 0, 0, 0.04)" : "inherit")};
`;

const TrashIcon = styled.span`
  font-size: 1.5em;
  padding-left: 0.5em;
  cursor: pointer;
`;

const BiljettField = styled(Field)`
  padding: 0 0.5em;
`;

const AddIcon = styled.span`
  font-size: 1.5em;
  cursor: pointer;
`;

const AddForetagsbiljettContainer = styled.div`
  max-width: 15em;
  display: flex;
  justify-content: center;
  padding-bottom: 2em;
`;

const Foretagsbiljett = ({
  dateFocused,
  biljett,
  index,
  editable = true,
  handleChangeFocus,
  handleChangeForetagsbiljett,
  handleSetExpiresForetagsbiljett,
  handleRemoveForetagsbiljett
}) => (
  <ForetagsbiljettWrapper>
    <BiljettField text="Nummer">
      {editable ? (
        <ForetagsbiljettInput
          type="text"
          value={biljett.number}
          maxLength={11}
          onChange={v => handleChangeForetagsbiljett(index, v)}
        />
      ) : (
        <div>{biljett.number}</div>
      )}
    </BiljettField>
    <BiljettField text="Utgångsdatum">
      {editable ? (
        <DatePicker
          numberOfMonths={1}
          focused={dateFocused}
          onFocusChange={({ focused }) => handleChangeFocus(index, focused)}
          onDateChange={v => handleSetExpiresForetagsbiljett(index, v)}
          date={moment(biljett.expires)}
        />
      ) : (
        <div>{formatYMD(biljett.expires)}</div>
      )}
    </BiljettField>
    <BiljettField text="Status">{biljett.status || "Available"}</BiljettField>
    <TrashIcon>
      <i
        onClick={() => handleRemoveForetagsbiljett(biljett, index)}
        className="fa fa-trash"
        aria-hidden="true"
      />
    </TrashIcon>
  </ForetagsbiljettWrapper>
);

class ForetagsbiljettList extends Component {
  state = {
    focusedIndex: -1,
    tempTickets: [],
    errors: null,
    success: false
  };

  updateForetagsbiljett = (index, biljett) => {
    this.setState(({ tempTickets }) => {
      const newTickets = tempTickets.map((number, i) => {
        if (index === i) {
          return { ...number, ...biljett };
        } else {
          return number;
        }
      });
      return { tempTickets: newTickets };
    });
  };

  handleChangeFocus = (index, focused) => {
    this.setState(state => ({
      focusedIndex: !focused ? -1 : index
    }));
  };

  handleChangeForetagsbiljett = (index, { target: { value } }) => {
    this.updateForetagsbiljett(index, { number: value });
  };

  handleSetExpiresForetagsbiljett = (index, expires) =>
    this.updateForetagsbiljett(index, { expires });

  addForetagsbiljett = () => {
    const foretagsbiljett = { number: "", expires: DEFAULT_DATE };
    this.setState(state => ({
      tempTickets: [...state.tempTickets, foretagsbiljett]
    }));
  };

  handleRemoveForetagsbiljett = index => {
    const { tempTickets } = this.state;

    const biljetterWithoutAtIndex = [
      ...tempTickets.slice(0, index),
      ...tempTickets.slice(index + 1)
    ];

    this.setState({ tempTickets: biljetterWithoutAtIndex });
  };

  handleSubmit = () => {
    const tickets = this.state.tempTickets
      .filter(({ number }) => number && number.trim())
      .map(({ number, expires }) => ({
        number,
        expires: formatYMD(expires)
      }));

    this.props
      .addForetagsbiljett(tickets)
      .then(success => {
        this.setState({
          tempTickets: [],
          success: true,
          errors: null
        });
      })
      .catch(errors => {
        this.setState({ errors, success: false });
      });
  };

  renderTickets = (tickets, editable, handlePressRemove) => {
    const { focusedIndex } = this.state;
    return tickets.map((biljett, i) => (
      <Foretagsbiljett
        key={i}
        biljett={biljett}
        index={i}
        editable={editable}
        dateFocused={i === focusedIndex}
        handleChangeFocus={this.handleChangeFocus}
        handleChangeForetagsbiljett={this.handleChangeForetagsbiljett}
        handleSetExpiresForetagsbiljett={this.handleSetExpiresForetagsbiljett}
        handleRemoveForetagsbiljett={handlePressRemove}
      />
    ));
  };

  render() {
    const { tempTickets, errors, success } = this.state;
    const { foretagsbiljetter = [], deleteForetagsbiljett } = this.props;

    return (
      <div>
        <SmallHeader>Företagsbiljetter</SmallHeader>
        <StatusMessageBox
          errors={errors}
          success={success}
          successMessage="Företagsbiljetter uppdaterades!"
        />
        {this.renderTickets(
          foretagsbiljetter,
          false,
          ({ number, expires }, index) =>
            deleteForetagsbiljett({ number, expires: formatYMD(expires) })
        )}
        {this.renderTickets(tempTickets, true, (biljett, index) =>
          this.handleRemoveForetagsbiljett(index)
        )}
        <AddForetagsbiljettContainer onClick={this.addForetagsbiljett}>
          <AddIcon>
            <i className="fa fa-plus-circle" aria-hidden="true" />
          </AddIcon>
        </AddForetagsbiljettContainer>
        <MainButton onClick={this.handleSubmit}>
          Spara företagsbiljetter
        </MainButton>
      </div>
    );
  }
}

const addForetagsbiljett = graphql(
  gql`
    mutation AddForetagsbiljett($tickets: [ForetagsbiljettInput!]) {
      addForetagsBiljetter(biljetter: $tickets) {
        id
        foretagsbiljetter {
          number
          expires
          status
        }
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      addForetagsbiljett: tickets => wrapMutate(mutate, { tickets })
    })
  }
);

const deleteForetagsbiljett = graphql(
  gql`
    mutation DeleteForetagsbiljett($ticket: ForetagsbiljettInput!) {
      deleteForetagsBiljett(biljett: $ticket) {
        id
        foretagsbiljetter {
          number
          expires
          status
        }
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      deleteForetagsbiljett: ticket => wrapMutate(mutate, { ticket })
    })
  }
);

export default compose(addForetagsbiljett, deleteForetagsbiljett)(
  ForetagsbiljettList
);
