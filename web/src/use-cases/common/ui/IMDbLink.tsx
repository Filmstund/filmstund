import React from "react";
import { GrayButton } from "./MainButton";

interface Props {
  imdbId: string;
}

export const IMDbLink: React.VFC<Props> = ({ imdbId }) => (
  <GrayButton
    onClick={() => window.open(`https://www.imdb.com/title/${imdbId}/`)}
  >
    IMDb
  </GrayButton>
);
