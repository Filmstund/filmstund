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

const DEFAULT_DATE = moment().add(1, "years");

const ForetagsbiljettWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
`;

const ForetagsbiljettInput = styled(Input)`
  max-width: 13.6em;
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
  handleChangeFocus,
  handleChangeForetagsbiljett,
  handleSetExpiresForetagsbiljett,
  handleRemoveForetagsbiljett
}) => (
  <ForetagsbiljettWrapper>
    <BiljettField text="Nummer">
      <ForetagsbiljettInput
        type="text"
        value={biljett.number}
        maxLength={11}
        onChange={v => handleChangeForetagsbiljett(index, v)}
      />
    </BiljettField>
    <BiljettField text="Utgångsdatum">
      <DatePicker
        numberOfMonths={1}
        focused={dateFocused}
        onFocusChange={({ focused }) => handleChangeFocus(index, focused)}
        onDateChange={v => handleSetExpiresForetagsbiljett(index, v)}
        date={moment(biljett.expires)}
      />
    </BiljettField>
    <BiljettField text="Status">{biljett.status || "Available"}</BiljettField>
    <TrashIcon>
      <i
        onClick={() => handleRemoveForetagsbiljett(index)}
        className="fa fa-trash"
        aria-hidden="true"
      />
    </TrashIcon>
  </ForetagsbiljettWrapper>
);

export default class ForetagsbiljettList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedIndex: -1,
      biljetter: props.biljetter
    };
  }

  updateForetagsbiljett = (index, biljett) => {
    const { biljetter } = this.state;
    const newTickets = biljetter.map((number, i) => {
      if (index === i) {
        return {
          ...number,
          ...biljett
        };
      } else {
        return number;
      }
    });

    this.setState({ biljetter: newTickets });
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
    const newTickets = [...this.state.biljetter, foretagsbiljett];
    this.setState({ biljetter: newTickets });
  };

  handleRemoveForetagsbiljett = index => {
    const { biljetter } = this.state;

    const biljetterWithoutAtIndex = [
      ...biljetter.slice(0, index),
      ...biljetter.slice(index + 1)
    ];

    this.setState({ biljetter: biljetterWithoutAtIndex });
  };

  handleSubmit = () => {
    const tickets = this.state.biljetter.map(ftg => ({
      number: ftg.number,
      expires: formatYMD(ftg.expires)
    }));

    // this.props.updateTickets(tickets);
  };

  render() {
    const { biljetter, focusedIndex } = this.state;

    return (
      <div>
        <SmallHeader>Företagsbiljetter</SmallHeader>
        {biljetter.map((biljett, i) => (
          <Foretagsbiljett
            key={i}
            biljett={biljett}
            index={i}
            dateFocused={i === focusedIndex}
            handleChangeFocus={this.handleChangeFocus}
            handleChangeForetagsbiljett={this.handleChangeForetagsbiljett}
            handleSetExpiresForetagsbiljett={
              this.handleSetExpiresForetagsbiljett
            }
            handleRemoveForetagsbiljett={this.handleRemoveForetagsbiljett}
          />
        ))}
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
