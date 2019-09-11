import isBefore from "date-fns/isBefore";
import { groupBy, orderBy } from "lodash";
import * as React from "react";
import { SectionList } from "react-native";
import { NavigationInjectedProps, StackActions } from "react-navigation";
import { showingDate, today } from "./lib/filterShowings";
import { RedHeader } from "./RedHeader";
import { ShowingListItem } from "./ShowingListItem";
import { padding } from "./style";
import { useShowingsByMovieQuery } from "./useShowingsByMovieQuery";

export const ShowingsScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useShowingsByMovieQuery();

  const showings = data ? data.publicShowings : [];

  const { previous = [], upcoming = [] } = groupBy(
    showings,
    s => (isBefore(showingDate(s), today) ? "previous" : "upcoming")
  );

  const onPressShowing = (showingId: string) =>
    navigation.dispatch(
      StackActions.push({
        routeName: "Showing",
        params: {
          showingId
        }
      })
    );

  const onPressTicket = (showingId: string) =>
    navigation.dispatch(
      StackActions.push({
        routeName: "Ticket",
        params: {
          showingId
        }
      })
    );

  return (
    <SectionList
      refreshing={fetching}
      onRefresh={executeQuery}
      sections={[
        {
          title: "Aktuella besök",
          data: orderBy(upcoming, [showingDate], ["asc"])
        },
        {
          title: "Tidigare besök",
          data: orderBy(previous, [showingDate], ["desc"])
        }
      ]}
      renderSectionHeader={({ section }) => (
        <RedHeader style={{ padding, paddingBottom: 10 }}>
          {section.title}
        </RedHeader>
      )}
      renderItem={({ item: showing }) => (
        <ShowingListItem
          key={showing.id}
          showing={showing}
          onPressShowTicket={() => onPressTicket(showing.id)}
          onPressShowing={() => onPressShowing(showing.id)}
        />
      )}
    />
  );
};
