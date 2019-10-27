import React from "react";
import { GrayButton } from "./MainButton";

const GrayButtonLink = GrayButton.withComponent("a");

const IMDbLink = ({ imdbId }) => (
  <GrayButtonLink target="_blank" href={`http://www.imdb.com/title/${imdbId}/`}>
    IMDb
  </GrayButtonLink>
);

export default IMDbLink;
