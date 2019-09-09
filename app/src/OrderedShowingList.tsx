import { orderBy } from "lodash";
import * as React from "react";
import { Text, View } from "react-native";
import { ShowingsByMovieQuery_publicShowings } from "./__generated__/ShowingsByMovieQuery";
import { showingDate } from "./lib/filterShowings";
import { ShowingListItem } from "./ShowingListItem";

export const OrderedShowingList = ({
  onPressShowing,
  onPressTicket,
  order,
  showings
}: {
  order: "asc" | "desc";
  showings: ShowingsByMovieQuery_publicShowings[];
  onPressTicket: (showingId: string) => void;
  onPressShowing: (showingId: string) => void;
}) => {
  if (showings.length === 0) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: 50
        }}
      >
        <Text style={{ color: "#9b9b9b" }}>Inga besök</Text>
      </View>
    );
  }

  return (
    <>
      {orderBy(showings, [showingDate], [order]).map(
        (showing: ShowingsByMovieQuery_publicShowings) => (
          <ShowingListItem
            key={showing.id}
            showing={showing}
            onPressShowTicket={() => onPressTicket(showing.id)}
            onPressShowing={() => onPressShowing(showing.id)}
          />
        )
      )}
    </>
  );
};
