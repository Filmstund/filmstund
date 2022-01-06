import styled from "@emotion/styled";
import * as React from "react";
import fslogo from "../../assets/fslogo.png";
import { TicketFragment } from "../../__generated__/types";

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
  <FlexRowContainer style={{ marginBottom: "1rem" }}>
    <img
      alt="FS logo"
      src={fslogo}
      style={{ height: "3rem", width: "auto", marginRight: "1rem" }}
    />
    <FlexColumnContainer>
      <HeaderText style={{ fontSize: "1rem" }}>{cinema}</HeaderText>
      <LabelText>Filmstaden</LabelText>
    </FlexColumnContainer>
  </FlexRowContainer>
);

const TicketHeader: React.FC<
  Pick<
    TicketFragment["myTickets"][0],
    "movieName" | "movieRating" | "attributes"
  >
> = ({ movieName, movieRating, attributes }) => (
  <FlexColumnContainer style={{ marginBottom: "1rem" }}>
    <HeaderText style={{ marginBottom: "0.5rem" }}>{movieName}</HeaderText>
    <FlexSpaceRowContainer>
      <FlexRowContainer>
        {(attributes || []).map((attr) => (
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
  style = {},
}) => (
  <FlexColumnContainer style={{ ...style, paddingRight: "1rem" }}>
    <LabelText>{label}</LabelText>
    <HeaderText>{value}</HeaderText>
  </FlexColumnContainer>
);

const TicketDateTime: React.FC<
  Pick<TicketFragment["myTickets"][0], "date" | "time">
> = ({ date, time }) => (
  <FlexRowContainer style={{ marginBottom: "1rem" }}>
    <TicketValueWithLabel label="Datum" value={date.toString()} />
    <TicketValueWithLabel label="Tid" value={time.substring(0, 5)} />
  </FlexRowContainer>
);

const TicketPlacement: React.FC<
  Pick<TicketFragment["myTickets"][0], "screen" | "seat">
> = ({ screen, seat }) => (
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
  </FlexRowPaddingContainer>
);

const TicketCustomerType: React.FC<
  Pick<TicketFragment["myTickets"][0], "customerType">
> = ({ customerType }) => (
  <FlexRowContainer style={{ marginBottom: "1rem", fontWeight: 500 }}>
    {customerType}
  </FlexRowContainer>
);

interface TicketCodeProps
  extends Pick<TicketFragment["myTickets"][0], "id" | "profileID"> {
  src: string;
}

const AztecCodeImage = styled.img`
  width: 128px;
  height: 128px;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  filter: contrast(2);
`;

const TicketCode: React.FC<TicketCodeProps> = ({ src, id, profileID }) => {
  return (
    <FlexRowContainer style={{ marginBottom: "1rem" }}>
      <FlexColumnContainer style={{ alignItems: "left" }}>
        <AztecCodeImage alt={id} src={src} />
        <div>
          {id} {profileID}
        </div>
      </FlexColumnContainer>
    </FlexRowContainer>
  );
};

interface Props {
  ticket: TicketFragment["myTickets"][0];
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
    attributes,
    profileID,
    seat,
    barcode,
  },
}) => (
  <TicketWrapper>
    <CompanyHeader cinema={cinema} />
    <TicketHeader
      attributes={attributes}
      movieName={movieName}
      movieRating={movieRating}
    />
    <TicketDateTime date={date} time={time} />
    <TicketPlacement screen={screen} seat={seat} />
    <TicketCustomerType customerType={customerType} />
    <TicketCode id={id} profileID={profileID} src={barcode} />
  </TicketWrapper>
);
