/** @jsx jsx */
import { jsx } from "@emotion/core";
import styled from "@emotion/styled";
import * as React from "react";
import fslogo from "../../assets/fslogo.png";
import { TicketQuery_showing_myTickets } from "./__generated__/TicketQuery";

const TicketWrapper = styled.div`
  margin: 3rem 0;
  padding: 1rem;
  max-width: 24rem;
  border: 0.0625rem dotted #c5c5c5;
  font-family: "SF-Sans", sans-serif;
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
  font-weight: 700;
`;

const LabelText = styled.div`
  font-size: 0.75rem;
  opacity: 0.54;
`;

const ShowAttribute = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  line-height: 1.125rem;
  border-radius: 0.625rem;
  border: 0.0625rem solid rgba(0, 0, 0, 0.5);
  padding: 0 0.5rem;
  color: rgba(0, 0, 0, 0.5);
  margin-right: 0.25rem;
`;

const FlexRowPaddingContainer = styled(FlexRowContainer)`
  padding: 1rem;
`;

const CompanyHeader: React.FC<{ cinema: string }> = ({ cinema }) => (
  <FlexRowContainer css={{ marginBottom: "1rem" }}>
    <img
      alt="FS logo"
      src={fslogo}
      css={{ height: "3rem", width: "auto", marginRight: "1rem" }}
    />
    <FlexColumnContainer>
      <HeaderText css={{ fontSize: "1rem" }}>{cinema}</HeaderText>
      <LabelText>Filmstaden</LabelText>
    </FlexColumnContainer>
  </FlexRowContainer>
);

const TicketHeader: React.FC<
  Pick<
    TicketQuery_showing_myTickets,
    "movieName" | "movieRating" | "showAttributes"
  >
> = ({ movieName, movieRating, showAttributes }) => (
  <FlexColumnContainer css={{ marginBottom: "1rem" }}>
    <HeaderText css={{ marginBottom: "0.5rem" }}>{movieName}</HeaderText>
    <FlexSpaceRowContainer>
      <FlexRowContainer>
        {(showAttributes || []).map(attr => (
          <ShowAttribute key={attr}>{attr}</ShowAttribute>
        ))}
      </FlexRowContainer>
      {movieRating}
    </FlexSpaceRowContainer>
  </FlexColumnContainer>
);

interface TicketValueWithLabelProps {
  label: string;
  value: string | number;
  style?: {};
}

const TicketValueWithLabel: React.FC<TicketValueWithLabelProps> = ({
  label,
  value,
  style = {}
}) => (
  <FlexColumnContainer css={{ ...style, paddingRight: "1rem" }}>
    <LabelText>{label}</LabelText>
    <HeaderText>{value}</HeaderText>
  </FlexColumnContainer>
);

const TicketDateTime: React.FC<
  Pick<TicketQuery_showing_myTickets, "date" | "time">
> = ({ date, time }) => (
  <FlexRowContainer css={{ marginBottom: "1rem" }}>
    <TicketValueWithLabel label="Datum" value={date} />
    <TicketValueWithLabel label="Tid" value={time.substring(0, 5)} />
  </FlexRowContainer>
);

const TicketPlacement: React.FC<
  Pick<TicketQuery_showing_myTickets, "screen" | "seat">
> = ({ screen, seat }) => (
  <FlexRowPaddingContainer
    css={{ marginBottom: "1rem", border: ".0625rem solid #000" }}
  >
    <TicketValueWithLabel
      label="Salong"
      value={screen}
      css={{ width: "50%" }}
    />
    <TicketValueWithLabel label="Rad" value={seat.row} />
    <TicketValueWithLabel label="Stolsnr" value={seat.number} />
  </FlexRowPaddingContainer>
);

const TicketCustomerType: React.FC<
  Pick<TicketQuery_showing_myTickets, "customerType">
> = ({ customerType }) => (
  <FlexRowContainer css={{ marginBottom: "1rem", fontWeight: 500 }}>
    {customerType}
  </FlexRowContainer>
);

interface TicketCodeProps
  extends Pick<TicketQuery_showing_myTickets, "id" | "profileId"> {
  src: string;
}

const AztecCodeImage = styled.img`
  width: 128px;
  height: 128px;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  filter: contrast(2);
`;

const TicketCode: React.FC<TicketCodeProps> = ({ src, id, profileId }) => {
  return (
    <FlexRowContainer css={{ marginBottom: "1rem" }}>
      <FlexColumnContainer css={{ alignItems: "left" }}>
        <AztecCodeImage alt={id} src={src} />
        <div>
          {id} {profileId}
        </div>
      </FlexColumnContainer>
    </FlexRowContainer>
  );
};

interface Props {
  ticket: TicketQuery_showing_myTickets;
}

export const Ticket: React.FC<Props> = ({
  ticket: {
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
    seat,
    barcode
  }
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
    <TicketCode id={id} profileId={profileId} src={barcode} />
  </TicketWrapper>
);
