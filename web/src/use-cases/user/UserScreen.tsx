import { gql } from "@apollo/client";
import * as React from "react";
import { completeUserFragment } from "../../apollo/queries/currentUser";
import { UserProfileQuery } from "../../__generated__/types";
import Profile from "./ProfileView";
import { suspend } from "suspend-react";
import { client } from "../../store/apollo";

const query = gql`
  query UserProfile {
    me: currentUser {
      ...CompleteUser
      calendarFeedUrl
    }
  }
  ${completeUserFragment}
`;

const UserScreen = () => {
  const { data } = suspend(
    () =>
      client.query<UserProfileQuery>({
        query,
        canonizeResults: true,
        fetchPolicy: "network-only",
      }),
    ["user", "profile"]
  );

  return <Profile me={data.me} />;
};

export default UserScreen;
