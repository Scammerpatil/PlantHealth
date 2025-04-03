import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Unable to fetch user data. Please try again.");
        router.push("/user/Home");
      }
    };
    fetchUser();
  }, []);
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <ScrollView className="flex-1 bg-base-100">
        <View className="items-center p-6">
          <View className="relative">
            <Image
              source={
                user?.profilePicture ||
                require("../../../assets/images/image.png")
              }
              className="w-24 h-24 rounded-full border-4 border-base-content"
            />
          </View>
          <Text className="text-xl text-base-content font-bold mt-2">
            {user?.name || "User Name"}
          </Text>
        </View>

        {/* Personal Info Section */}
        <View className="bg-base-300 p-4 rounded-lg mx-4">
          <Text className="text-base-content/50 text-sm">
            PERSONAL INFORMATION
          </Text>
          <View className="mt-2">
            <InfoRow label="Username" value={user.name} />
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
          </View>
        </View>

        {/* Social Accounts */}
        <View className="bg-base-300 p-4 rounded-lg mx-4 mt-4">
          <Text className="text-base-content/50 text-sm">SOCIAL ACCOUNTS</Text>
          <View className="mt-2">
            <SocialRow
              platform="Google"
              status="Connected"
              icon="logo-google"
            />
          </View>
        </View>
        <View className="h-16 mt-6">
          <TouchableOpacity
            style={{
              backgroundColor: "#FF3D00",
              borderRadius: 8,
              padding: 10,
              marginTop: 16,
              marginHorizontal: 16,
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              flexDirection: "row",
              gap: 10,
            }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="black" />
            <Text className="text-error-content font-semibold text-center">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between border-b border-base-content py-2">
    <Text className="text-base-content/60">{label}</Text>
    <Text className="text-base-content/80 font-semibold">{value}</Text>
  </View>
);

const SocialRow = ({
  platform,
  status,
  icon,
}: {
  platform: string;
  status: string;
  icon: any;
}) => (
  <View className="flex-row justify-between items-center py-2">
    <View className="flex-row items-center">
      <Ionicons name={icon} size={20} color="green" className="mr-2" />
      <Text className="text-base-content">{platform}</Text>
    </View>
    <Text className="text-success font-semibold">{status}</Text>
  </View>
);
