import React from "react";

import { orderBy, take } from "lodash";
import { PlusUsers, UserHead, UsersContainer } from "./style";

interface Props {
  users: { avatarURL?: string | null; id: string }[];
  maxCount?: number;
}

export const UserHeads: React.VFC<Props> = ({ users, maxCount = 5 }) => {
  const rest = users.length - maxCount;

  // Hack to shift people with default Google avatar to the end
  // For some reason the url of default avatars are longer
  const sortedHeads = orderBy(users, [(u) => u.avatarURL?.length], ["asc"]);

  return (
    <UsersContainer>
      {rest > 0 && <PlusUsers>+{rest}</PlusUsers>}
      {take(sortedHeads, maxCount)
        .reverse()
        .map((user, index, list) => (
          <UserHead
            key={user.id}
            src={user.avatarURL ?? ""}
            last={index === list.length - 1}
          />
        ))}
    </UsersContainer>
  );
};
