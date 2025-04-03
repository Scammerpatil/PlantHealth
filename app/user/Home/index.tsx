import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthProvider";
import { Prediction } from "@/Types/Prediciton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPredictions = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem("user")!);
      const response = await fetch(
        `http://localhost:8081/api/user/predictions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.email }),
        }
      );
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deletePrediction = async (id: string) => {
    try {
      await fetch(`http://localhost:8081/api/user/delete?${id}`, {
        method: "DELETE",
      });
      setPredictions(predictions.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting prediction:", error);
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence <= 0.4) return "Not Confirmed";
    if (confidence <= 0.7) return "Maybe";
    return "Confirmed";
  };

  useEffect(() => {
    console.log("Fetching predictions...");
    fetchPredictions();
  }, []);

  return (
    <>
      <Navbar />
      <View className="flex-1 bg-base-100 p-6">
        <Text className="text-2xl font-bold text-center text-success mb-4 uppercase">
          Past Predictions
        </Text>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : (
          <FlatList
            data={predictions}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchPredictions}
              />
            }
            renderItem={({ item }) => (
              <View className="bg-base-200 p-4 mb-4 rounded-lg shadow-md">
                <Image
                  source={{ uri: "data:image/jpeg;base64," + item.image }}
                  className="w-full h-40 rounded-lg mb-2"
                  resizeMode="contain"
                />
                <Text className="text-lg font-semibold text-base-content">
                  Prediction: {item.prediction}
                </Text>
                <Text className="text-sm text-base-content/50">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <Text className="text-sm font-bold text-base-content mt-2">
                  Confidence: {getConfidenceLevel(item.confidence)}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "red",
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                  onPress={() => deletePrediction(item._id)}
                >
                  <Text className="text-white font-semibold text-center">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
      <Footer />
    </>
  );
}
