import gql from "graphql-tag";
import * as React from "react";
import { useQuery } from "react-apollo";
import { completeUserFragment } from "../../apollo/queries/currentUser";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import { UserProfile } from "./__generated__/UserProfile";
import Profile from "./ProfileView";

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
  const { data } = useQuery<UserProfile>(query, {
    fetchPolicy: "cache-and-network"
  });

  if (!data || !data.me) {
    return <Loader />;
  } else {
    return <Profile me={data.me} />;
  }
};
export default UserScreen;
