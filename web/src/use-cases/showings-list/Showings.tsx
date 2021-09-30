import isBefore from "date-fns/isBefore";
import { gql, useQuery } from "@apollo/client";
import { groupBy } from "lodash-es";
import React from "react";

import { getTodaysDate } from "../../lib/dateTools";
import { showingFragment } from "../common/showing/fragment";
import { Link } from "../common/ui/MainButton";

import { RedHeader } from "../common/ui/RedHeader";
import { PageTitle } from "../common/utils/PageTitle";
import { OrderedShowingsList } from "../my-showings/OrderedShowingsList";
import { showingDate } from "../my-showings/utils/filtersCreators";
import { ShowingsQuery } from "./__generated__/ShowingsQuery";

const today = getTodaysDate();

const Showings: React.FC = () => {
  const { data } = usePublicShowings();

  const showings = data ? data.showings : [];

  const { previous = [], upcoming = [] } = groupBy(showings, (s) =>
    isBefore(showingDate(s), today) ? "previous" : "upcoming"
  );

  return (
    <>
      <PageTitle title="Alla besök" />
      <Link to="/showings/new">Skapa nytt besök</Link>
      <RedHeader>Aktuella besök</RedHeader>
      <OrderedShowingsList showings={upcoming} order={"asc"} />
      <RedHeader>Tidigare besök</RedHeader>
      <OrderedShowingsList showings={previous} order={"desc"} />
    </>
  );
};

const usePublicShowings = () =>
  useQuery<ShowingsQuery>(
    gql`
      query ShowingsQuery {
        showings: publicShowings {
          ...ShowingNeue
          id
          webId
          slug
          date
          time
        }
      }
      ${showingFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
    }
  );

export default Showings;
