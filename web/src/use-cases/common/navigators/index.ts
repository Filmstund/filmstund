import { NavigateFunction } from "react-router-dom";

interface NavigateToShowingParams {
  webId: string;
  slug: string;
}

export const navigateToShowing = (
  navigate: NavigateFunction,
  { webId, slug }: NavigateToShowingParams
) => navigate(`/showings/${webId}/${slug}`);

export const navigateToEditShowing = (
  navigate: NavigateFunction,
  { webId, slug }: NavigateToShowingParams
) => navigate(`/showings/${webId}/${slug}/edit`);

export const navigateToShowingTickets = (
  navigate: NavigateFunction,
  { webId, slug }: NavigateToShowingParams
) => navigate(`/showings/${webId}/${slug}/tickets`);
