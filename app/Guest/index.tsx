import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const moreInfo = {
  "Early Blight":
    "Early Blight is a fungal disease caused by *Alternaria solani*. It causes dark, concentric lesions on leaves, stems, and fruits. The disease thrives in warm, moist conditions and can spread quickly.",
  "Late Blight":
    "Late Blight is a severe fungal disease caused by *Phytophthora infestans*. It leads to large, dark lesions on leaves and stems, causing them to rot. It thrives in cool, moist conditions and spreads rapidly.",
};

const GuestPage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [textClass, setTextClass] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      setImage(result.assets[0]?.base64!);
      setImageUrl(result.assets[0]?.uri!);
      setPrediction(null);
      setInterpretation(null);
      setSuggestions([]);
      setTextClass("");
    }
  };

  const captureImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]?.base64!);
      setImage(result.assets[0].base64!);
      setPrediction(null);
      setInterpretation(null);
      setSuggestions([]);
      setTextClass("");
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    setPrediction(null);
    setInterpretation(null);
    setSuggestions([]);
    setTextClass("");

    try {
      const response = await fetch(`http://localhost:8081/api/guest-predict`, {
        method: "POST",
        body: JSON.stringify({ image: image }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        Alert.alert("Error", "No Leaf Detected");
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setInterpretation(data.interpretation);
      setSuggestions(data.suggestions);
      setTextClass(data.textClass);
    } catch (error) {
      console.error("Prediction failed:", error);
      Alert.alert("Error", "Failed to get a prediction. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={24} />
      </TouchableOpacity>

      {image && <Image source={{ uri: imageUrl! }} style={styles.image} />}
      {!image && (
        <Image
          source={require("../../assets/images/preview.png")}
          style={styles.image}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={captureImage}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.buttonText}>Capture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="image" size={20} color="#fff" />
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.uploadImageButton, loading && styles.disabledButton]}
        onPress={uploadImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="cloud-upload" size={20} color="#fff" />
        )}
        <Text style={styles.buttonText}>
          {loading ? "Uploading..." : "Upload Image"}
        </Text>
      </TouchableOpacity>

      <View
        className="mt-4 max-w-md mx-auto p-4"
        style={{
          backgroundColor: "#ccc",
        }}
      >
        {prediction && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              className={`text-xl font-bold text-center uppercase mt-4 `}
              style={{
                color: textClass,
                fontSize: 20,
              }}
            >
              Prediction: {prediction}
            </Text>
            {(prediction === "Early Blight" ||
              prediction === "Late Blight") && (
              <TouchableOpacity
                style={styles.moreInfoButton}
                onPress={() => setShowModal(true)}
              >
                <Text className="text-white font-bold">{"More Info"}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {interpretation && (
          <Text style={[styles.predictionText, { color: textClass }]}>
            {interpretation}
          </Text>
        )}

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggested Actions:</Text>
            {suggestions.map((suggestion, index) => (
              <Text key={index} style={styles.suggestionText}>
                - {suggestion}
              </Text>
            ))}
          </View>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text className="text-xl font-bold mb-4">
              More Info: {prediction}
            </Text>
            <Text className="text-lg text-base-content/80 mb-4">
              {moreInfo[prediction!]}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className="w-full py-4 bg-base-200 items-center mt-10">
        <Text className="text-sm text-base-content/50 text-center">
          © 2023 PlantHealth. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: "auto",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#F0F0F0",
    padding: 8,
    borderRadius: 50,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4CAF50",
    marginTop: 40,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },
  image: {
    marginTop: 50,
    height: 250,
    width: 250,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  captureButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#43A047",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  predictionText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 10,
  },
  suggestionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  suggestionText: {
    fontSize: 14,
    color: "#6B7280",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
  moreInfoButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  closeButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
});

export default GuestPage;
