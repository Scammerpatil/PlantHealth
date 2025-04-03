import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import "../global.css";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const handleGoogleSignIn = async () => {
    GoogleSignin.configure({});
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { email, name, photo } = userInfo?.data?.user || {};
      console.log("User Info:", userInfo);
      const userData = { email, name, photo };
      try {
        const response = await fetch("http://localhost:8081/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (response.ok) {
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          Alert.alert("Login Successful", "You have successfully logged in.", [
            { text: "OK" },
          ]);
          router.push("/user/Home");
        } else {
          console.error("Error creating user:", data.message);
          Alert.alert(
            "Login Failed",
            "There was an error logging in. Please try again.",
            [{ text: "OK" }]
          );
          router.push("/");
        }
      } catch (error) {
        console.error("Error creating user:", error);
        Alert.alert(
          "Login Failed",
          "There was an error logging in. Please try again.",
          [{ text: "OK" }]
        );
        router.push("/");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
        Alert.alert(
          "Login Cancelled",
          "You have cancelled the login flow. Please try again.",
          [{ text: "OK" }]
        );
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress already");
        Alert.alert(
          "Sign In In Progress",
          "Sign in is already in progress. Please wait.",
          [{ text: "OK" }]
        );
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available or outdated");
        Alert.alert(
          "Play Services Not Available",
          "Play services are not available or outdated. Please update your Google Play services.",
          [{ text: "OK" }]
        );
      } else {
        console.error(error);
      }
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        router.push("/user/Home");
      }
    };
    fetchUser();
  }, []);
  return (
    <>
      <View
        className="flex-1 bg-base-100 justify-center items-center p-6"
        data-theme="forest"
      >
        <Image
          source={require("../assets/images/bg.png")}
          className="w-32 h-32 mb-6"
          style={{ width: 200, height: 200 }}
        />
        <Text className="text-3xl font-bold text-base-content mb-4 text-center uppercase">
          Welcome to Plant-Health
        </Text>
        <Text className="text-base text-base-content/50 text-center mb-6">
          Detect diseases in potato leaves using AI-powered analysis.
        </Text>
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          style={{
            backgroundColor: "#4285F4",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginBottom: 12,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text className="font-semibold text-white">Let's Get Started</Text>
        </TouchableOpacity>

        <Text className="py-3 mb-2">OR</Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#4CAF50",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginBottom: 12,
            width: "100%",
            alignItems: "center",
          }}
          onPress={() => router.push("/Guest")}
        >
          <Text className="font-semibold">Login As Guest</Text>
        </TouchableOpacity>
        <Text className="text-sm text-base-content/50 text-center mb-6">
          By signing up, you agree to our{" "}
          <Text className="font-bold link">Terms of Service</Text> and
          <Text className="font-bold link"> Privacy Policy</Text>
        </Text>
      </View>
    </>
  );
}
