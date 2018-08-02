export const navigateToShowing = (history, { webId, slug }) =>
  history.push(`/showings/${webId}/${slug}`);

export const navigateToEditShowing = (history, { webId, slug }) =>
  history.push(`/showings/${webId}/${slug}/edit`);

export const navigateToShowingTickets = (history, { webId, slug }) =>
  history.push(`/showings/${webId}/${slug}/tickets`);
