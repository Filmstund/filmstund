import React from "react";
import styled from "styled-components";
import sflogo from '../../assets/sf.jpg';
import AztecCode from './AztecCode';


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

const FlexRowPaddingContainer = styled(FlexRowContainer) `padding: 1rem`;


const CompanyHeader = ({ cinema }) =>
  <FlexRowContainer style={{ marginBottom: "1rem" }}>
    <img
      alt="Sf logo"
      src={sflogo}
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

const TicketCode = ({ id, profileId }) => {
  return (
    <FlexRowContainer style={{ marginBottom: "1rem" }}>
      <FlexColumnContainer style={{ alignItems: "left" }}>
        <AztecCode text={id} />
        <div>
          {id} {profileId}
        </div>
      </FlexColumnContainer>
    </FlexRowContainer>
  );
};

const Ticket = ({
  id,
  cinema,
  time,
  date,
  movieName,
  movieRating,
  screen,
  customerType,
  showAttributes,
  profileId,
  seat
}) => (
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
      <TicketCode id={id} profileId={profileId} />
    </TicketWrapper>
  );


export default Ticket;