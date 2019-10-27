import { orderBy, take } from "lodash-es";
import React from "react";
import { HomeQuery_showings_attendees_userInfo } from "../../my-showings/__generated__/HomeQuery";
import { PlusUsers, UserHead, UsersContainer } from "./style";

interface Props {
  users: HomeQuery_showings_attendees_userInfo[];
  maxCount?: number;
}

export const UserHeads: React.FC<Props> = ({ users, maxCount = 5 }) => {
  const rest = users.length - maxCount;

  // Hack to shift people with default Google avatar to the end
  // For some reason the url of default avatars are longer
  const sortedHeads = orderBy(users, [u => (u.avatar || "").length], ["asc"]);

  return (
    <UsersContainer>
      {rest > 0 && <PlusUsers>+{rest}</PlusUsers>}
      {take(sortedHeads, maxCount)
        .reverse()
        .map((user, index, list) => (
          <UserHead
            key={user.id}
            src={user.avatar || ""}
            last={index === list.length - 1}
          />
        ))}
    </UsersContainer>
  );
};
