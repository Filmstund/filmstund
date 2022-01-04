import { gql, useQuery } from "@apollo/client";
import React from "react";
import { showingFragment } from "../common/showing/fragment";

import { Link } from "../common/ui/MainButton";
import { RedHeader } from "../common/ui/RedHeader";
import { PageTitle } from "../common/utils/PageTitle";
import { HomeQueryQuery } from "../../__generated__/types";
import { FeaturedShowing } from "./FeaturedShowing";
import { OrderedShowingsList } from "./OrderedShowingsList";
import {
  filterShowingsCreatedByMe,
  filterShowingsParticipatedByMeAndAfterToday,
  filterShowingsParticipatedByMeAndBeforeToday,
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
    </>
  );
};

const useHomeScreenData = () =>
  useQuery<HomeQueryQuery>(
    gql`
      query HomeQuery {
        showings: publicShowings {
          ...ShowingNeue
          id
          webID
          slug
          date
          time
          admin {
            id
          }
          attendees {
            userID
          }
        }
        me: currentUser {
          id
        }
      }
      ${showingFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
    }
  );

export default Home;
