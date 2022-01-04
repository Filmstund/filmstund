import { NavigateFunction } from "react-router-dom";

interface NavigateToShowingParams {
  webID: string;
  slug: string;
}

export const navigateToShowing = (
  navigate: NavigateFunction,
  { webID, slug }: NavigateToShowingParams
) => navigate(`/showings/${webID}/${slug}`);

export const navigateToEditShowing = (
  navigate: NavigateFunction,
  { webID, slug }: NavigateToShowingParams
) => navigate(`/showings/${webID}/${slug}/edit`);

export const navigateToShowingTickets = (
  navigate: NavigateFunction,
  { webID, slug }: NavigateToShowingParams
) => navigate(`/showings/${webID}/${slug}/tickets`);
