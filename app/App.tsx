import * as React from "react";
import { useState } from "react";
import { Image, SafeAreaView, Text, View, StatusBar } from "react-native";
import { GoogleSigninButton, GoogleSignin } from "react-native-google-signin";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
// @ts-ignore
import { createBottomTabNavigator } from "react-navigation-tabs";
import { padding } from "./src/style";
import { TicketScreen } from "./src/TicketScreen";
import { TodayScreen } from "./src/TodayScreen";


GoogleSignin.configure({
  iosClientId: "692064172675-montab9pi57304e68r932c6lm7111oaf.apps.googleusercontent.com"
});

const MoviesScreen: React.FC = () => {
  return <Text>Movies</Text>;
};

const ShowingsScreen: React.FC = () => {
  return <Text>Showings</Text>;
};

const ProfileScreen: React.FC = () => {
  return <Text>Profile</Text>;
};

const TodayStack = createStackNavigator({
  Today: {
    screen: TodayScreen,
    navigationOptions: options => ({
      title: "Today"
    })
  },
  Ticket: {
    screen: TicketScreen
  }
});

const TabNavigator = createBottomTabNavigator(
  {
    Today: TodayStack,
    Movies: MoviesScreen,
    Showings: ShowingsScreen,
    Account: ProfileScreen
  },
  {
    tabBarOptions: {
      activeTintColor: "#fff",
      inactiveTintColor: "#e6b8be",
      style: {
        color: "white",
        backgroundColor: "#d0021b"
      }
    }
  }
);

const AppNavigator = createSwitchNavigator({
  Home: TabNavigator
});

const AppContainer = createAppContainer(AppNavigator);

const App = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [isSigninInProgress, setSigninInProgress] = useState(false);

  const handleSignIn = async () => {
    const userInfo = await GoogleSignin.signIn();

    console.log(userInfo);

  };

  if (signedIn) {
    return <AppContainer />;
  } else {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'black' }}
      >
        <StatusBar barStyle={'light-content'}/>
        <View style={{ alignItems: "center", backgroundColor: 'white', padding, borderRadius: 3 }}>
          <Image source={require("./logo.png")} />
          <Text style={{ padding, fontWeight: '500' }}>Logga in för att boka biobesök</Text>
          <GoogleSigninButton
            style={{ width: 230, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={handleSignIn}
            disabled={isSigninInProgress}
          />
        </View>
      </SafeAreaView>
    );
  }
};

export default App;
