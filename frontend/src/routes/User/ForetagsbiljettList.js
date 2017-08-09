import React, { Component } from "react";
import moment from "moment";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Field from "../../Field";
import { SmallHeader } from "../../Header";
import Input from "../../Input";

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
`;

const Foretagsbiljett = ({
  biljett,
  index,
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
        selected={moment(biljett.expires)}
        onChange={v => handleSetExpiresForetagsbiljett(index, v)}
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

  handleChangeForetagsbiljett = (index, { target: { value } }) => {
    this.updateForetagsbiljett(index, { number: value });
  }

  handleSetExpiresForetagsbiljett = (index, expires) =>
    this.updateForetagsbiljett(index, { expires });

  addForetagsbiljett = () => {
    const foretagsbiljett = { number: "", expires: DEFAULT_DATE };
    this.props.onChange([...this.props.biljetter, foretagsbiljett]);
  };

  handleRemoveForetagsbiljett = index => {
    const { biljetter } = this.props;

    this.props.onChange(biljetter.slice(index, 1));
  };

  render() {
    const { biljetter } = this.props;

    return (
      <div>
        <SmallHeader>Företagsbiljetter</SmallHeader>
        {biljetter.map((biljett, i) =>
          <Foretagsbiljett
            key={i}
            biljett={biljett}
            index={i}
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
