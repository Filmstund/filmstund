import styled from "@emotion/styled";
import React from "react";

import { formatShowingDateTime } from "../../../lib/dateTools";
import PosterBox from "../ui/PosterBox";
import { PageTitle } from "../utils/PageTitle";
import { MovieFragment } from "../../../__generated__/types";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;

const Status = styled.div<{ ticketsBought?: boolean }>`
  position: absolute;
  right: 1em;
  top: 1em;
  font-style: ${(props) => (props.ticketsBought ? "" : "italic")};
`;

const capitilized = (s: string) =>
  s.substring(0, 1).toUpperCase() + s.substring(1);

const getStatus = (ticketsBought: boolean) => {
  if (ticketsBought) {
    return "bokad";
  } else {
    return "preliminär";
  }
};

const StyledShowing = styled.div<{ disabled?: boolean }>`
  position: relative;
  &:not(:last-child) {
    margin-bottom: 1em;
  }
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

interface AdminProps {
  name: string;
  nick?: string | null | undefined;
}

interface Props {
  movie?: MovieFragment;
  admin: AdminProps | undefined | null;
  location: string;
  date: string;
  setTitleTag?: boolean;
  ticketsBought?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const SimpleShowing: React.FC<Props> = ({
  movie,
  date,
  admin,
  setTitleTag = false,
  ticketsBought = false,
  location,
  disabled = false,
  onClick,
}) => (
  <StyledShowing disabled={disabled}>
    {setTitleTag && (
      <PageTitle
        title={`${movie?.title ?? ""} ${formatShowingDateTime(date)}`}
      />
    )}
    <PosterBox
      headerText={movie?.title ?? ""}
      poster={movie?.poster}
      onClick={onClick}
    >
      {ticketsBought !== undefined && (
        <Status ticketsBought={ticketsBought}>
          {capitilized(getStatus(ticketsBought))}
        </Status>
      )}
      <VerticalPaddingContainer>
        {formatShowingDateTime(date)}
        <br />
        {location}
        <br />
      </VerticalPaddingContainer>
      {admin && <span>Skapad av {admin.nick ?? admin.name}</span>}
    </PosterBox>
  </StyledShowing>
);

export default SimpleShowing;
