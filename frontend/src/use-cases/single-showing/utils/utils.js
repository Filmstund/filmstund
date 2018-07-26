export const userIsAdmin = (showing, user) => {
  return showing.admin.id === user.id;
};

export const userIsParticipating = (participants, user) => {
  return participants.some(p => p.user.id === user.id);
};
