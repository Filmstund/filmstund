import React, { Component } from "react";
import styled from "styled-components";
import { SingleDatePicker as DatePicker } from "react-dates";
import moment from "moment";
import 'react-dates/lib/css/_datepicker.css';
import Field from "../../Field";
import { SmallHeader } from "../../Header";
import Input from "../../Input";

const DEFAULT_DATE = moment().add(1, "years");

const ForetagsbiljettWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
`;

const ForetagsbiljettInput = styled(Input) `
  max-width: 13.6em;
`;

const TrashIcon = styled.span`
  font-size: 1.5em;
  padding-left: 0.5em;
  cursor: pointer;
`;

const BiljettField = styled(Field) `
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
`;

const Foretagsbiljett = ({
  dateFocused,
  biljett,
  index,
  handleChangeFocus,
  handleChangeForetagsbiljett,
  handleSetExpiresForetagsbiljett,
  handleRemoveForetagsbiljett
}) =>
  <ForetagsbiljettWrapper>
    <BiljettField text="Kortnummer">
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
    <BiljettField text="Status">
      {biljett.status || "Available"}
    </BiljettField>
    <TrashIcon>
      <i
        onClick={() => handleRemoveForetagsbiljett(index)}
        className="fa fa-trash"
        aria-hidden="true"
      />
    </TrashIcon>
  </ForetagsbiljettWrapper>;

export default class ForetagsbiljettList extends Component {
  state = {
    focusedIndex: -1
  };

  updateForetagsbiljett = (index, biljett) => {
    const { biljetter } = this.props;

    this.props.onChange(
      biljetter.map((number, i) => {
        if (index === i) {
          return {
            ...number,
            ...biljett
          };
        } else {
          return number;
        }
      })
    );
  };

  handleChangeFocus = (index, focused) => {
    this.setState(state => ({
      focusedIndex: !focused ? -1 : index
    }))
  }

  handleChangeForetagsbiljett = (index, { target: { value } }) => {
    this.updateForetagsbiljett(index, { number: value });
  };

  handleSetExpiresForetagsbiljett = (index, expires) =>
    this.updateForetagsbiljett(index, { expires });

  addForetagsbiljett = () => {
    const foretagsbiljett = { number: "", expires: DEFAULT_DATE };
    this.props.onChange([...this.props.biljetter, foretagsbiljett]);
  };

  handleRemoveForetagsbiljett = index => {
    const { biljetter } = this.props;

    const biljetterWithoutAtIndex = [
      ...biljetter.slice(0, index),
      ...biljetter.slice(index + 1)
    ];

    this.props.onChange(biljetterWithoutAtIndex);
  };

  render() {
    const { biljetter } = this.props;
    const { focusedIndex } = this.state;

    return (
      <div>
        <SmallHeader>Företagsbiljetter</SmallHeader>
        {biljetter.map((biljett, i) =>
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
        )}
        <AddForetagsbiljettContainer onClick={this.addForetagsbiljett}>
          <AddIcon>
            <i className="fa fa-plus-circle" aria-hidden="true" />
          </AddIcon>
        </AddForetagsbiljettContainer>
      </div>
    );
  }
}
