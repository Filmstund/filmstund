import React from "react";

import { Link } from "../common/ui/MainButton";
import { RedHeader } from "../common/ui/RedHeader";
import { PageTitle } from "../common/utils/PageTitle";
import { useHomeQuery } from "../../__generated__/types";
import { FeaturedShowing } from "./FeaturedShowing";
import { OrderedShowingsList } from "./OrderedShowingsList";
import {
  filterShowingsCreatedByMe,
  filterShowingsParticipatedByMeAndAfterToday,
  filterShowingsParticipatedByMeAndBeforeToday,
} from "./utils/filtersCreators";

const Home: React.FC = () => {
  const [{ data }] = useHomeQuery();

  const showings = data?.showings ?? [];
  const me = data?.me;

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

export default Home;
