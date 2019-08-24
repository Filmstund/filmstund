import { orderBy } from "lodash-es";
import React from "react";
import { useRouter } from "../../lib/useRouter";
import {
  navigateToShowing,
  navigateToShowingTickets
} from "../common/navigators";
import { ShowingNeue } from "../common/showing/__generated__/ShowingNeue";
import { ShowingNeue as ShowingNeueComponent } from "../common/showing/ShowingNeue";
import { EmptyList } from "../common/ui/EmptyList";
import { ShowingsGrid } from "../common/ui/ShowingsGrid";
import { showingDate } from "./utils/filtersCreators";

interface OrderedShowingsListProps {
  showings: ShowingNeue[];
  order: "asc" | "desc";
}

export const OrderedShowingsList: React.FC<OrderedShowingsListProps> = ({
  showings,
  order
}) => {
  const { history } = useRouter();

  if (showings.length === 0) {
    return <EmptyList />;
  }
  return (
    <ShowingsGrid>
      {orderBy(showings, [showingDate], [order]).map(showing => (
        <ShowingNeueComponent
          showing={showing}
          onClick={() => navigateToShowing(history, showing)}
          onClickTickets={() => navigateToShowingTickets(history, showing)}
          key={showing.id}
        />
      ))}
    </ShowingsGrid>
  );
};
