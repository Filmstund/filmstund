import React from "react";
import styled from "@emotion/styled";
import { formatShowingDate, getTodaysDate } from "../../../lib/dateTools";
import PosterBox from "../ui/PosterBox";
import { MovieFragment } from "../../../__generated__/types";
import isAfter from "date-fns/isAfter";
import parseISO from "date-fns/parseISO";

const VerticalPaddingContainer = styled.div`
  padding: 1em 0;
`;

const now = getTodaysDate();

const renderPremiereDate = (releaseDate: string) => {
  const formattedDate = formatShowingDate(releaseDate);

  if (isAfter(parseISO(releaseDate), now)) {
    return "Premiär " + formattedDate;
  } else {
    return null;
  }
};

interface Props {
  movie: MovieFragment;
  onClick: () => void;
}

const Movie: React.VFC<Props> = ({
  movie: { poster, title, releaseDate },
  onClick,
  ...props
}) => (
  <div {...props}>
    <PosterBox headerText={title} poster={poster} onClick={onClick}>
      <VerticalPaddingContainer>
        {renderPremiereDate(releaseDate)}
      </VerticalPaddingContainer>
    </PosterBox>
  </div>
);

export default Movie;
