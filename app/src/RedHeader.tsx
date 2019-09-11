import * as React from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";

export const RedHeader: React.FC<{ style?: StyleProp<ViewStyle> }> = ({
  children,
  style
}) => (
  <View style={[{ backgroundColor: "white" }, style]}>
    <Text
      style={{
        color: "#4a4a4a",
        fontSize: 18,
        fontWeight: "500",
        paddingBottom: 5
      }}
    >
      {children}
    </Text>
    <View style={{ backgroundColor: "#d0021b", flex: 1, height: 4 }} />
  </View>
);
