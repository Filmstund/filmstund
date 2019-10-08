import { orderBy } from "lodash";
import * as React from "react";
import { SectionList } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import {
  filterShowingsParticipatedByMeAndAfterToday,
  filterShowingsParticipatedByMeAndBeforeToday,
  showingDate
} from "./lib/filterShowings";
import { RedHeader } from "./RedHeader";
import { ShowingListItem } from "./ShowingListItem";
import { padding } from "./style";
import { useShowingsByMovieQuery } from "./useShowingsByMovieQuery";

export const TodayScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useShowingsByMovieQuery();

  const onPressShowing = (showingId: string) =>
    navigation.navigate({
      routeName: "Showing",
      params: {
        showingId
      }
    });

  const onPressTicket = (showingId: string) =>
    navigation.navigate({
      routeName: "Ticket",
      params: {
        showingId
      }
    });

  const showings = data ? data.publicShowings : [];

  const meId = data && data.me ? data.me.id : "";

  return (
    <SectionList
      refreshing={fetching}
      onRefresh={() => executeQuery({ requestPolicy: 'network-only' })}
      sections={[
        {
          title: "Mina kommande besök",
          data: orderBy(
            showings.filter(filterShowingsParticipatedByMeAndAfterToday(meId)),
            [showingDate],
            ["asc"]
          )
        },
        {
          title: "Mina tidigare besök",
          data: orderBy(
            showings.filter(filterShowingsParticipatedByMeAndBeforeToday(meId)),
            [showingDate],
            ["desc"]
          )
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
