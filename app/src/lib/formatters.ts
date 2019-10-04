import { ShowingQuery_showing_admin } from "../__generated__/ShowingQuery";

export const formatUserNick = (user: ShowingQuery_showing_admin) => {
  if (user.nick) {
    return user.nick;
  } else {
    return `${user.firstName} ${user.lastName}`;
  }
};
export const formatUserCompleteName = (user: ShowingQuery_showing_admin) => {
  if (user.nick) {
    return `${user.firstName} '${user.nick}' ${user.lastName}`;
  } else {
    return `${user.firstName} ${user.lastName}`;
  }
};
