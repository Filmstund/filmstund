import gql from "graphql-tag";
import React from "react";
import { useQuery } from "react-apollo";
import { showingFragment } from "../common/showing/fragment";

import { Link } from "../common/ui/MainButton";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import { RedHeader } from "../common/ui/RedHeader";
import { PageTitle } from "../common/utils/PageTitle";
import { HomeQuery } from "./__generated__/HomeQuery";
import { FeaturedShowing } from "./FeaturedShowing";
import { OrderedShowingsList } from "./OrderedShowingsList";
import {
  filterShowingsCreatedByMe,
  filterShowingsParticipatedByMeAndAfterToday,
  filterShowingsParticipatedByMeAndBeforeToday
} from "./utils/filtersCreators";

const Home: React.FC = () => {
  const { data } = useHomeScreenData();

  const showings = data ? data.showings : [];
  const me = data ? data.me : undefined;

  if (!me) {
    return null;
  }

  return (
    <>
      <PageTitle title="Mina Besök" />
      <FeaturedShowing showings={showings} meId={me.id} />
      <PageWidthWrapper>
        <Link to="/showings/new">Skapa nytt besök</Link>
        <RedHeader>Mina kommande besök</RedHeader>

        <OrderedShowingsList
          showings={showings.filter(
            filterShowingsParticipatedByMeAndAfterToday(me.id)
          )}
          order={"asc"}
        />

        <RedHeader>Mina tidigare besök</RedHeader>
        <OrderedShowingsList
          showings={showings.filter(
            filterShowingsParticipatedByMeAndBeforeToday(me.id)
          )}
          order={"desc"}
        />
        <RedHeader>Besök jag har skapat</RedHeader>
        <OrderedShowingsList
          showings={showings.filter(filterShowingsCreatedByMe(me.id))}
          order={"desc"}
        />
      </PageWidthWrapper>
    </>
  );
};

const useHomeScreenData = () =>
  useQuery<HomeQuery>(
    gql`
      query HomeQuery {
        showings: publicShowings {
          ...ShowingNeue
          id
          webId
          slug
          date
          time
          admin {
            id
          }
          participants {
            user {
              id
            }
          }
        }
        me: currentUser {
          id
        }
      }
      ${showingFragment}
    `,
    {
      fetchPolicy: "cache-and-network"
    }
  );

export default Home;
