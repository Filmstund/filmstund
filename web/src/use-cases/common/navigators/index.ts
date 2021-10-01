import { History } from "history";

interface NavigateToShowingParams {
  webId: string;
  slug: string;
}

export const navigateToShowing = (
  history: History,
  { webId, slug }: NavigateToShowingParams
) => history.push(`/showings/${webId}/${slug}`);

export const navigateToEditShowing = (
  history: History,
  { webId, slug }: NavigateToShowingParams
) => history.push(`/showings/${webId}/${slug}/edit`);

export const navigateToShowingTickets = (
  history: History,
  { webId, slug }: NavigateToShowingParams
) => history.push(`/showings/${webId}/${slug}/tickets`);
