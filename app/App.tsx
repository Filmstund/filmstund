import * as React from "react";
import { useEffect, useState } from "react";
import { Image, SafeAreaView, StatusBar, Text, View } from "react-native";
import { GoogleSignin, GoogleSigninButton } from "react-native-google-signin";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
// @ts-ignore
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createClient, Provider } from "urql";
import { AccountScreen } from "./src/AccountScreen";
import { getToken, setToken } from "./src/lib/session";
import { MoviesScreen } from "./src/MoviesScreen";
import { ShowingScreen } from "./src/ShowingScreen";
import { ShowingsScreen } from "./src/ShowingsScreen";
import { padding } from "./src/style";
import { TicketScreen } from "./src/TicketScreen";
import { TodayScreen } from "./src/TodayScreen";

GoogleSignin.configure({
  scopes: ["profile", "email", "openid"],
  iosClientId:
    "976792570239-2plt93mmibojvtq3ipngcmk6php2eajq.apps.googleusercontent.com"
});

const TodayStack = createStackNavigator({
  Today: {
    screen: TodayScreen,
    navigationOptions: options => ({
      title: "Today"
    })
  },
  Showing: {
    screen: ShowingScreen
  },
  Ticket: {
    screen: TicketScreen
  }
});

const MoviesStack = createStackNavigator({
  Movies: {
    screen: MoviesScreen,
    navigationOptions: options => ({
      title: "Movies"
    })
  }
});

const AccountStack = createStackNavigator({
  Account: {
    screen: AccountScreen,
    navigationOptions: options => ({
      title: "Account"
    })
  }
});

const ShowingsStack = createStackNavigator({
  Showings: {
    screen: ShowingsScreen,
    navigationOptions: options => ({
      title: "Showings"
    })
  },
  Showing: {
    screen: ShowingScreen
  },
  Ticket: {
    screen: TicketScreen
  }
});

const TabNavigator = createBottomTabNavigator(
  {
    Today: TodayStack,
    Movies: MoviesStack,
    Showings: ShowingsStack,
    Account: AccountStack
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

const client = createClient({
  url: "http://192.168.1.13:8080/graphql",
  fetchOptions: () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
});

const App = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isSigninInProgress, setSigninInProgress] = useState(false);

  useEffect(() => {
    async function restoreToken() {
      try {
        // await GoogleSignin.signOut()
        const user = await GoogleSignin.signInSilently();
        console.log(user);

        if (user.idToken) {
          setToken(user.idToken);
          //   setSignedIn(true);
        }
      } catch (e) {
        return;
      } finally {
        setLoaded(true);
      }
    }
    restoreToken();
  }, []);

  const handleSignIn = async () => {
    setSigninInProgress(true);
    try {
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.idToken) {
        setToken(userInfo.idToken);
        setSignedIn(true);
      }
    } catch (error) {
      setSignedIn(false);
      setSigninInProgress(false);
    }
  };

  if (!loaded) {
    return null;
  }

  if (signedIn) {
    return (
      <Provider value={client}>
        <AppContainer />
      </Provider>
    );
  } else {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black"
        }}
      >
        <StatusBar barStyle={"light-content"} />
        <View
          style={{
            alignItems: "center",
            backgroundColor: "white",
            padding,
            borderRadius: 3
          }}
        >
          <Image source={require("./logo.png")} />
          <Text style={{ padding, fontWeight: "500" }}>
            Logga in för att boka biobesök
          </Text>
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
