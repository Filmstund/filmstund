import React, { Component } from "react";
import styled from "styled-components";
import { getJson } from "../../lib/fetch";
import Loader from "../../ProjectorLoader";

const TicketWrapper = styled.div`
  margin: 3rem 0;
  padding: 1rem;
  max-width: 24rem;
  border: .0625rem dotted #c5c5c5;
`;
const FlexRowContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const FlexSpaceRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const FlexColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const HeaderText = styled.div`
  font-size: 1.375rem;
  font-weight: bold;
`;

const LabelText = styled.div`
  font-size: 0.75rem;
  opacity: 0.54;
`;

const ShowAttribute = styled.span`
  display: inline-block;
  font-size: 0.625rem;
  padding: .125rem .25rem;
  color: #000;
  margin-right: 0.25rem;
  background: #d6d6d6;
`;

const FlexRowPaddingContainer = styled(FlexRowContainer)`padding: 1rem`;

const CompanyHeader = ({ cinema }) =>
  <FlexRowContainer style={{ marginBottom: "1rem" }}>
    <img
      alt="Sf logo"
      src="https://msprod-catalogapi.dxcloud.episerver.net/images/ncg-images/37aca75e43d44104b54405cca445dd33.jpg?width=120&version=46D168EDFD626F8CFB66B4E2E0EED76C"
      style={{ height: "3rem", width: "auto", marginRight: "1rem" }}
    />
    <FlexColumnContainer>
      <HeaderText style={{ fontSize: "1rem" }}>
        {cinema}
      </HeaderText>
      <LabelText>SF Bio</LabelText>
    </FlexColumnContainer>
  </FlexRowContainer>;

const TicketHeader = ({ movieName, movieRating, showAttributes }) =>
  <FlexColumnContainer style={{ marginBottom: "1rem" }}>
    <HeaderText style={{ marginBottom: "0.5rem" }}>
      {movieName}
    </HeaderText>
    <FlexSpaceRowContainer>
      <FlexRowContainer>
        {showAttributes.map(attr =>
          <ShowAttribute key={attr}>
            {attr}
          </ShowAttribute>
        )}
      </FlexRowContainer>
      {movieRating}
    </FlexSpaceRowContainer>
  </FlexColumnContainer>;

const TicketValueWithLabel = ({ label, value, style }) =>
  <FlexColumnContainer style={{ ...style, paddingRight: "1rem" }}>
    <LabelText>
      {label}
    </LabelText>
    <HeaderText>
      {value}
    </HeaderText>
  </FlexColumnContainer>;

const TicketDateTime = ({ date, time }) =>
  <FlexRowContainer style={{ marginBottom: "1rem" }}>
    <TicketValueWithLabel label="Datum" value={date} />
    <TicketValueWithLabel label="Tid" value={time.substring(0, 5)} />
  </FlexRowContainer>;

const TicketPlacement = ({ screen, seat }) =>
  <FlexRowPaddingContainer
    style={{ marginBottom: "1rem", border: ".0625rem solid #000" }}
  >
    <TicketValueWithLabel
      label="Salong"
      value={screen}
      style={{ width: "50%" }}
    />
    <TicketValueWithLabel label="Rad" value={seat.row} />
    <TicketValueWithLabel label="Stolsnr" value={seat.number} />
  </FlexRowPaddingContainer>;

const TicketCustomerType = ({ customerType }) =>
  <FlexRowContainer style={{ marginBottom: "1rem", fontWeight: "bold" }}>
    {customerType}
  </FlexRowContainer>;

const TicketCode = ({ src, id }) => {
  return (
    <FlexRowContainer style={{ marginBottom: "1rem" }}>
      <FlexColumnContainer style={{ alignItems: "center" }}>
        <img alt={id} src={src} />
        <div>
          {id}
        </div>
      </FlexColumnContainer>
    </FlexRowContainer>
  );
};

export default class Ticket extends Component {
  state = {
    ticketdata: null,
    error: null
  };

  componentWillMount() {
    getJson(`/tickets/${this.props.showingId}`).then(
      ticketdata => {
        this.setState({ ticketdata });
      },
      err => {
        this.setState({
          error: "Ingen biljett registrerad för köpet"
        });
      }
    );
  }

  render() {
    const { ticketdata, error } = this.state;
    if (error) {
      return (
        <div>
          {error}
        </div>
      );
    } else if (!ticketdata) {
      return <Loader />;
    } else {
      const {
        id,
        cinema,
        time,
        date,
        movieName,
        movieRating,
        screen,
        customerType,
        showAttributes,
        seat,
        barcode
      } = ticketdata;
      return (
        <TicketWrapper>
          <CompanyHeader cinema={cinema} />
          <TicketHeader
            showAttributes={showAttributes}
            movieName={movieName}
            movieRating={movieRating}
          />
          <TicketDateTime date={date} time={time} />
          <TicketPlacement screen={screen} seat={seat} />
          <TicketCustomerType customerType={customerType} />
          <TicketCode id={id} src={barcode} />
        </TicketWrapper>
      );
    }
  }
}
