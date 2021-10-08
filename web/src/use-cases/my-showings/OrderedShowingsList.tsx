import { orderBy } from "lodash";
import React from "react";
import {
  navigateToShowing,
  navigateToShowingTickets,
} from "../common/navigators";
import { ShowingNeue } from "../common/showing/__generated__/ShowingNeue";
import { ShowingNeue as ShowingNeueComponent } from "../common/showing/ShowingNeue";
import { EmptyList } from "../common/ui/EmptyList";
import { ShowingsGrid } from "../common/ui/ShowingsGrid";
import { showingDate } from "./utils/filtersCreators";
import { useNavigate } from "react-router-dom";

interface OrderedShowingsListProps {
  showings: ShowingNeue[];
  order: "asc" | "desc";
}

export const OrderedShowingsList: React.FC<OrderedShowingsListProps> = ({
  showings,
  order,
}) => {
  const navigate = useNavigate();

  if (showings.length === 0) {
    return <EmptyList />;
  }
  return (
    <ShowingsGrid>
      {orderBy(showings, [showingDate], [order]).map((showing) => (
        <ShowingNeueComponent
          showing={showing}
          onClick={() => navigateToShowing(navigate, showing)}
          onClickTickets={() => navigateToShowingTickets(navigate, showing)}
          key={showing.id}
        />
      ))}
    </ShowingsGrid>
  );
};
