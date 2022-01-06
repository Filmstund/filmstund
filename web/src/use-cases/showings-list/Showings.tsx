import isBefore from "date-fns/isBefore";
import { groupBy } from "lodash";
import React from "react";

import { getTodaysDate } from "../../lib/dateTools";
import { Link } from "../common/ui/MainButton";

import { RedHeader } from "../common/ui/RedHeader";
import { PageTitle } from "../common/utils/PageTitle";
import { OrderedShowingsList } from "../my-showings/OrderedShowingsList";
import { showingDate } from "../my-showings/utils/filtersCreators";
import { useShowingsQuery } from "../../__generated__/types";

const today = getTodaysDate();

const Showings: React.FC = () => {
  const [{ data }] = useShowingsQuery();

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

export default Showings;
