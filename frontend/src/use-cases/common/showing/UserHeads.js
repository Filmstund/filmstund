import React from "react";

import orderBy from "lodash/orderBy";
import { PlusUsers, UserHead, UsersContainer } from "./style";
import take from "lodash/take";

export const UserHeads = ({ users, maxCount = 5 }) => {
  const rest = users.length - maxCount;

  // Hack to shift people with default Google avatar to the end
  // For some reason the url of default avatars are longer
  const sortedHeads = orderBy(users, [u => u.avatar.length], ["asc"]);

  return (
    <UsersContainer>
      {rest > 0 && <PlusUsers>+{rest}</PlusUsers>}
      {take(sortedHeads, maxCount)
        .reverse()
        .map((user, index, list) => (
          <UserHead
            key={user.id}
            src={user.avatar}
            last={index === list.length - 1}
          />
        ))}
    </UsersContainer>
  );
};
