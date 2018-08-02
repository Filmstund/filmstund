import React, { Component } from "react";
import styled from "styled-components";
import MainButton from "../../use-cases/common/ui/MainButton";

import Field from "../../use-cases/common/ui/Field";
import { SmallHeader } from "../../use-cases/common/ui/Header";
import Input from "../../use-cases/common/ui/Input";

import { formatYMD } from "../../lib/dateTools";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { wrapMutate } from "../../store/apollo";
import { margin } from "../../lib/style-vars";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faTrash from "@fortawesome/fontawesome-free-solid/faTrash";
import faPlusCircle from "@fortawesome/fontawesome-free-solid/faPlusCircle";

import addYears from "date-fns/add_years";
import Loadable from "react-loadable";

const DatePickerInput = Loadable({
  loader: () => import("../../use-cases/common/ui/date-picker/DatePickerInput"),
  loading: () => null
});

const DEFAULT_DATE = addYears(new Date(), 1);

const ForetagsbiljettWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
`;

const ForetagsbiljettInput = styled(Input)`
  max-width: 13.6em;
  background: ${props => (props.disabled ? "rgba(0, 0, 0, 0.04)" : "inherit")};
`;

const IconButton = styled(FontAwesomeIcon)`
  padding-left: ${margin};
  cursor: pointer;
`;

const BiljettField = styled(Field)`
  padding: 0 0.5em;
`;

const AddForetagsbiljettContainer = styled.div`
  max-width: 15em;
  display: flex;
  padding-bottom: 2em;
`;

const localizeTicketStatus = status => {
  switch (status) {
    case "Available":
      return "Tillgänglig";
    case "Pending":
      return "Upptagen";
    case "Used":
      return "Använd";
    case "Expired":
      return "Utgången";
    default:
      return status;
  }
};

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
        <DatePickerInput
          value={biljett.expires}
          onChange={v => handleSetExpiresForetagsbiljett(index, v)}
        />
      ) : (
        <div>{formatYMD(biljett.expires)}</div>
      )}
    </BiljettField>
    <BiljettField text="Status">
      {localizeTicketStatus(biljett.status)}
    </BiljettField>

    <IconButton
      size="2x"
      icon={faTrash}
      onClick={() => handleRemoveForetagsbiljett(biljett, index)}
    />
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

  handleDeleteForetagsBiljett = ({ status, number, expires }) => {
    switch (status) {
      case "Available":
        if (window.confirm("Är du säker på att du vill ta bort biljetten?")) {
          this.props.deleteForetagsbiljett({ number, expires });
        }
        break;
      case "Pending":
        window.alert("Biljetten används på en visning som ej har bokats ännu");
        break;
      case "Used":
      case "Expired":
        this.props.deleteForetagsbiljett({ number, expires });
        break;
      default:
        throw new Error(`Invalid status ${status}`);
    }
  };

  render() {
    const { tempTickets, errors, success } = this.state;
    const { foretagsbiljetter = [] } = this.props;

    return (
      <div>
        <SmallHeader>Företagsbiljetter</SmallHeader>
        <StatusMessageBox
          errors={errors}
          success={success}
          successMessage="Företagsbiljetter uppdaterades!"
        />
        {this.renderTickets(foretagsbiljetter, false, (ticket, index) =>
          this.handleDeleteForetagsBiljett(ticket)
        )}
        {this.renderTickets(tempTickets, true, (biljett, index) =>
          this.handleRemoveForetagsbiljett(index)
        )}
        <AddForetagsbiljettContainer onClick={this.addForetagsbiljett}>
          <IconButton size="2x" icon={faPlusCircle} />
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

export default compose(
  addForetagsbiljett,
  deleteForetagsbiljett
)(ForetagsbiljettList);
