import * as React from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { AccountQuery_currentUser } from "./__generated__/AccountQuery";
import { EmptyList } from "./EmptyList";
import { padding } from "./style";
import { useMeQuery } from "./useMeQuery";

const ForetagsbiljettHeader = () => (
  <View style={{ flexDirection: "row", marginVertical: 10 }}>
    <View style={{ width: 120 }}>
      <Text>Nummer</Text>
    </View>
    <View style={{ width: 120 }}>
      <Text>Utgångsdatum</Text>
    </View>
    <View style={{ width: 100 }}>
      <Text>Status</Text>
    </View>
  </View>
);

const UserAccountDetails = ({
  currentUser
}: {
  currentUser: AccountQuery_currentUser;
}) => (
  <View
    style={{
      flexDirection: "row",
      backgroundColor: "white",
      shadowColor: "black",
      shadowOpacity: 0.5,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
      marginBottom: 20
    }}
  >
    {currentUser.avatar ? (
      <Image
        source={{
          uri: currentUser.avatar,
          height: 96,
          width: 96
        }}
      />
    ) : (
      <View style={{ width: 96, height: 96 }} />
    )}
    <View
      style={{
        paddingHorizontal: padding,
        flex: 1,
        justifyContent: "center"
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        {currentUser.nick}
      </Text>
      <Text>
        {currentUser.firstName} {currentUser.lastName}
      </Text>
      <Text>{currentUser.email}</Text>
    </View>
  </View>
);

const emptyUser: AccountQuery_currentUser = {
  __typename: "CurrentUser",
  foretagsbiljetter: [],
  calendarFeedUrl: null,
  filmstadenMembershipId: null,
  lastName: "-",
  firstName: "-",
  nick: "",
  avatar: null,
  email: "-",
  phone: "-"
};

export const AccountScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useMeQuery();

  const user = data ? data.currentUser : emptyUser;

  return (
    <View style={{ flex: 1, paddingBottom: padding }}>
      <View style={{ padding, flex: 1 }}>
        <UserAccountDetails currentUser={user} />
        <Text style={{ fontWeight: "300", fontSize: 16 }}>
          Företagsbiljetter
        </Text>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={fetching}
              onRefresh={() => executeQuery({ requestPolicy: "network-only" })}
            />
          }
          style={{ flex: 1 }}
        >
          <ForetagsbiljettHeader />
          {user.foretagsbiljetter.map(biljett => (
            <View key={biljett.number} style={{ flexDirection: "row" }}>
              <View style={{ width: 120 }}>
                <Text>{biljett.number}</Text>
              </View>
              <View style={{ width: 120 }}>
                <Text>{biljett.expires}</Text>
              </View>
              <View style={{ width: 100 }}>
                <Text>{biljett.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {!fetching && !data && <EmptyList text={"Ingen data"} />}
    </View>
  );
};
