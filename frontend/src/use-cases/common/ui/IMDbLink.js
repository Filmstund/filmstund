import React from "react";
import { GrayButton } from "./MainButton";

const IMDbLink = ({ imdbId }) => (
  <GrayButton
    onClick={() => window.open(`http://www.imdb.com/title/${imdbId}/`)}
  >
    IMDb
  </GrayButton>
);

export default IMDbLink;
