import * as React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";

const Footer = () => {
  const route = useRoute();
  const router = useRouter();
  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={[styles.navItem, route.name === "Home" && styles.activeNavItem]}
        onPress={() => {
          console.log("Home pressed");
          router.push("/user/Home");
        }}
      >
        <AntDesign
          name="home"
          size={24}
          color={route.name === "Home" ? "green" : "black"}
        />
        <Text
          style={[
            styles.navLabel,
            route.name === "Home" && styles.activeNavLabel,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          route.name === "Predict" && styles.activeNavItem,
        ]}
        onPress={() => router.push("/user/Predict")}
      >
        <AntDesign
          name="camera"
          size={24}
          color={route.name === "Predict" ? "green" : "black"}
        />
        <Text
          style={[
            styles.navLabel,
            route.name === "Predict" && styles.activeNavLabel,
          ]}
        >
          Predict
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          route.name === "ChatBot" && styles.activeNavItem,
        ]}
        onPress={() => router.push("/user/ChatBot")}
      >
        <AntDesign
          name="message1"
          size={24}
          color={route.name === "ChatBot" ? "green" : "black"}
        />
        <Text
          style={[
            styles.navLabel,
            route.name === "ChatBot" && styles.activeNavLabel,
          ]}
        >
          ChatBot
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          route.name === "Profile" && styles.activeNavItem,
        ]}
        onPress={() => router.push("/user/Profile")}
      >
        <AntDesign
          name="user"
          size={24}
          color={route.name === "Profile" ? "green" : "black"}
        />
        <Text
          style={[
            styles.navLabel,
            route.name === "Profile" && styles.activeNavLabel,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    height: 70,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 5,
  },
  navLabel: {
    fontSize: 10,
    color: "black",
    marginTop: 3,
  },
  activeNavItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  activeNavLabel: {
    color: "green",
  },
});

export default Footer;
