import { format } from "date-fns";
import gql from "graphql-tag";
import * as React from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Picker,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { useMutation, useQuery } from "urql";
import {
  AttendShowing,
  AttendShowingVariables
} from "./__generated__/AttendShowing";
import {
  ForetagsbiljettStatus,
  PaymentOption,
  PaymentType
} from "./__generated__/globalTypes";
import { MeQuery_currentUser_foretagsbiljetter } from "./__generated__/MeQuery";
import {
  ShowingQuery,
  ShowingQueryVariables
} from "./__generated__/ShowingQuery";
import {
  UnattendShowing,
  UnattendShowingVariables
} from "./__generated__/UnattendShowing";
import { showingDate } from "./lib/filterShowings";
import { formatUserCompleteName, formatUserNick } from "./lib/formatters";
import { padding } from "./style";
import { useMeQuery } from "./useMeQuery";

const moviePoster =
  "https://catalog.cinema-api.com/images/ncg-images/e1cf3dd601ec4f23b4231f901f7b3c29.jpg?version=11D63C967B3576D4D5DBDE2A3ACFA3AB&width=240";

export const showingScreenShowing = gql`
  fragment ShowingScreenShowing on Showing {
    id
    date
    time
    ticketsBought
    admin {
      id
      firstName
      lastName
      nick
    }
    location {
      name
    }
    movie {
      id
      title
      poster
      imdbId
    }
    myTickets {
      id
    }
    participants {
      user {
        avatar
        firstName
        id
        lastName
        nick
      }
    }
  }
`;

const useShowingQuery = (showingId: string) =>
  useQuery<ShowingQuery, ShowingQueryVariables>({
    query: gql`
      query ShowingQuery($showingId: UUID!) {
        showing(id: $showingId) {
          ...ShowingScreenShowing
        }
      }
      ${showingScreenShowing}
    `,
    variables: { showingId }
  });

const useAttendShowing = () =>
  useMutation<AttendShowing, AttendShowingVariables>(gql`
    mutation AttendShowing($showingId: UUID!, $paymentOption: PaymentOption!) {
      attendShowing(paymentOption: $paymentOption, showingId: $showingId) {
        ...ShowingScreenShowing
      }
    }
    ${showingScreenShowing}
  `);

const useUnattendShowing = () =>
  useMutation<UnattendShowing, UnattendShowingVariables>(gql`
    mutation UnattendShowing($showingId: UUID!) {
      unattendShowing(showingId: $showingId) {
        ...ShowingScreenShowing
      }
    }
    ${showingScreenShowing}
  `);

const goldColor = "#f8d859";
const grayColor = "#bdbdbd";

const ShowingActionButton = ({
  onPress,
  backgroundColor = goldColor,
  text
}: {
  text: string;
  backgroundColor?: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        backgroundColor,
        paddingVertical: padding,
        paddingHorizontal: padding * 2,
        shadowColor: "black",
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "400" }}>{text}</Text>
    </View>
  </TouchableOpacity>
);

interface ShowingPaymentOptionModalProps {
  showModal: boolean;
  loading: boolean;
  onClose: () => void;
  showingId: string;
  tickets: MeQuery_currentUser_foretagsbiljetter[];
}

const ShowingPaymentOptionModal: React.FC<ShowingPaymentOptionModalProps> = ({
  showModal,
  onClose,
  showingId,
  loading,
  tickets
}) => {
  const [paymentOption, setPaymentOption] = useState<string>("swish");
  const [attendRes, attendShowing] = useAttendShowing();

  const isLoadingAttend = attendRes.fetching;

  return (
    <Modal
      visible={showModal}
      onDismiss={onClose}
      onRequestClose={onClose}
      animationType={"slide"}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={{ flex: 1 }} />
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {isLoadingAttend ? (
              <ActivityIndicator />
            ) : (
              <>
                <ShowingActionButton
                  text={"Jag hänger på!"}
                  onPress={() => {
                    attendShowing({
                      showingId,
                      paymentOption:
                        paymentOption === "swish"
                          ? swishPaymentOption
                          : {
                              type: PaymentType.Foretagsbiljett,
                              ticketNumber: paymentOption
                            }
                    }).then(onClose);
                  }}
                />
                <ShowingActionButton
                  text={"Avbryt"}
                  backgroundColor={grayColor}
                  onPress={onClose}
                />
              </>
            )}
          </View>
          <Picker
            selectedValue={paymentOption}
            onValueChange={itemValue => {
              setPaymentOption(itemValue);
            }}
          >
            <Picker.Item label={"Swish"} value={"swish"} />
            {tickets
              .filter(
                ticket => ticket.status === ForetagsbiljettStatus.Available
              )
              .map(ticket => (
                <Picker.Item
                  key={ticket.number}
                  label={`Företagsbiljett: ${ticket.number}`}
                  value={ticket.number}
                />
              ))}
          </Picker>
        </>
      )}
    </Modal>
  );
};

const swishPaymentOption: PaymentOption = { type: PaymentType.Swish };

export const ShowingScreen: React.FC<
  NavigationInjectedProps<{ showingId: string }>
> = ({ navigation }) => {
  const showingId = navigation.state.params
    ? navigation.state.params.showingId
    : "undefined";

  const [showModal, setShowModal] = useState(false);

  const [attendRes, attendShowing] = useAttendShowing();
  const [unattendRes, unattendShowing] = useUnattendShowing();
  const [{ data: me, fetchingMe }, refetchMeQuery] = useMeQuery();
  const [{ data, error, fetching }, executeQuery] = useShowingQuery(showingId);

  const isAttending =
    data &&
    me &&
    data.showing &&
    data.showing.participants.some(
      participant => participant.user.id === me.currentUser.id
    );

  const isLoadingAttendUnattend = attendRes.fetching || unattendRes.fetching;

  const handlePressAttendUnattend = () => {
    if (isAttending) {
      unattendShowing({ showingId }).then(() =>
        refetchMeQuery({ requestPolicy: "network-only" })
      );
    } else if (
      me.currentUser.foretagsbiljetter.some(
        ticket => ticket.status === ForetagsbiljettStatus.Available
      )
    ) {
      refetchMeQuery({ requestPolicy: "network-only" });
      setShowModal(true);
    } else {
      attendShowing({ showingId, paymentOption: swishPaymentOption });
    }
  };

  return (
    <>
      <ShowingPaymentOptionModal
        showingId={showingId}
        onClose={() => setShowModal(false)}
        showModal={showModal}
        loading={fetchingMe}
        tickets={me && me.currentUser ? me.currentUser.foretagsbiljetter : []}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={fetching} onRefresh={executeQuery} />
        }
      >
        {data && me &&
          data.showing && (
            <View style={{ padding }}>
              <View style={{ flexDirection: "row", backgroundColor: "white" }}>
                <Image
                  source={{
                    uri: data.showing.movie.poster || moviePoster,
                    height: 199,
                    width: 134
                  }}
                />
                <View style={{ padding, flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "500" }}>
                    {data.showing.movie.title}
                  </Text>
                  <Text>
                    {format(showingDate(data.showing), "d MMM HH:mm")}
                  </Text>
                  <Text>{data.showing.location.name}</Text>
                  <Text>Skapad av {formatUserNick(data.showing.admin)}</Text>
                </View>
              </View>
              <View
                style={{
                  justifyContent: "space-around",
                  marginVertical: padding * 3,
                  flexDirection: "row"
                }}
              >
                <ShowingActionButton
                  backgroundColor={grayColor}
                  text={"IMDb"}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.imdb.com/title/${data.showing.movie.imdbId}`
                    )
                  }
                />
                {data.showing.ticketsBought ? null : isLoadingAttendUnattend ? (
                  <ActivityIndicator />
                ) : (
                  <ShowingActionButton
                    backgroundColor={isAttending ? grayColor : goldColor}
                    text={isAttending ? "Avanmäl" : "Jag hänger på!"}
                    onPress={handlePressAttendUnattend}
                  />
                )}
                {data.showing.myTickets.length > 0 && (
                  <ShowingActionButton
                    text={"Biljetter"}
                    onPress={() =>
                      navigation.navigate({
                        routeName: "Ticket",
                        params: {
                          showingId
                        }
                      })
                    }
                  />
                )}
              </View>
              <View>
                <Text>{data.showing.participants.length} deltagare</Text>
                {data.showing.participants.map(participant => (
                  <View
                    key={participant.user.id}
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      backgroundColor: "white",
                      shadowRadius: 4,
                      shadowColor: "black",
                      shadowOpacity: 0.5,
                      shadowOffset: { width: 0, height: 2 }
                    }}
                  >
                    <Image
                      source={{
                        uri: participant.user.avatar,
                        width: 70,
                        height: 70
                      }}
                    />
                    <Text
                      style={{
                        padding,
                        fontSize: 18,
                        fontWeight: "300"
                      }}
                    >
                      {formatUserCompleteName(participant.user)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
      </ScrollView>
    </>
  );
};
