import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Translation Dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    captureUpload: "Capture or Upload Image",
    capture: "Capture",
    upload: "Upload",
    uploadImage: "Upload Image",
    uploading: "Uploading...",
    prediction: "Prediction",
    suggestedActions: "Suggested Actions",
    confidence: "Confidence",
  },
  hi: {
    captureUpload: "छवि कैप्चर या अपलोड करें",
    capture: "कैप्चर करें",
    upload: "अपलोड करें",
    uploadImage: "छवि अपलोड करें",
    uploading: "अपलोड हो रहा है...",
    prediction: "भविष्यवाणी",
    suggestedActions: "सुझाए गए कार्य",
  },
  mr: {
    captureUpload: "प्रतिमा कॅप्चर किंवा अपलोड करा",
    capture: "कॅप्चर करा",
    upload: "अपलोड करा",
    uploadImage: "प्रतिमा अपलोड करा",
    uploading: "अपलोड सुरू आहे...",
    prediction: "भविष्यवाणी",
    suggestedActions: "सूचित कृती",
  },
  ta: {
    captureUpload: "படத்தை பிடிக்க அல்லது பதிவேற்ற",
    capture: "பிடிக்க",
    upload: "பதிவேற்ற",
    uploadImage: "படத்தை பதிவேற்ற",
    uploading: "பதிவேற்றுகிறது...",
    prediction: "முன்னறிவிப்பு",
    suggestedActions: "பரிந்துரைக்கப்பட்ட செயல்கள்",
  },
  te: {
    captureUpload: "చిత్రాన్ని క్యాప్చర్ చేయండి లేదా అప్లోడ్ చేయండి",
    capture: "క్యాప్చర్",
    upload: "అప్లోడ్",
    uploadImage: "చిత్రాన్ని అప్లోడ్ చేయండి",
    uploading: "అప్లోడ్ జరుగుతోంది...",
    prediction: "అంచనా",
    suggestedActions: "సూచించిన చర్యలు",
  },
};

export default function CaptureScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState();
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [textClass, setTextClass] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("language");
        if (storedLanguage) {
          setLanguage(storedLanguage);
        } else {
          setLanguage("en");
        }
      } catch (error) {
        console.error("Error fetching language:", error);
      }
    };
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]?.base64!);
    }
  };

  const captureImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].base64!);
    }
  };

  const uploadImage = async () => {
    const language = await AsyncStorage.getItem("language");
    setLanguage(language!);
    if (!image) {
      Alert.alert("No image selected", "Please capture or upload an image.");
      return;
    }
    setLoading(true);
    setPrediction(null);
    setInterpretation(null);
    setConfidence(null);
    setSuggestions([]);
    setTextClass("");

    try {
      const user = await AsyncStorage.getItem("user");
      const email = JSON.parse(user!).email;
      if (!user) {
        Alert.alert("No user found", "Please log in to continue.");
        return;
      }
      const response = await fetch(`http://localhost:8081/api/user/predict`, {
        method: "POST",
        body: JSON.stringify({ image: image, email: email, language }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        Alert.alert("Error", "No Leaf Detected");
      }
      const data = await response.json();
      setPrediction(data.prediction);
      setConfidence(data.confidence);
      setInterpretation(data.interpretation);
      setSuggestions(data.suggestions);
      setTextClass(data.textClass);
    } catch (error) {
      console.log(error);
      Alert.alert("Upload Failed", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <ScrollView style={{ flexDirection: "column", padding: 16 }}>
        <Text className="text-2xl font-bold text-base-content mb-4 text-center uppercase">
          {translations[language].captureUpload}
        </Text>
        {image ? (
          <Image
            source={{ uri: "data:image/jpeg;base64," + image }}
            style={styles.image}
          />
        ) : (
          <Image
            source={require("../../../assets/images/preview.png")}
            style={styles.image}
          />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={captureImage} style={styles.captureButton}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text className="text-white font-bold ml-2">
              {translations[language].capture}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Ionicons name="image" size={20} color="#fff" />
            <Text className="text-white font-bold ml-2">
              {translations[language].upload}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={uploadImage}
          disabled={loading}
          style={[styles.uploadImageButton, loading && styles.disabledButton]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name="cloud-upload"
              size={20}
              color="text-secondary-content"
            />
          )}
          <Text className="text-secondary-content font-bold ml-2">
            {loading
              ? translations[language].uploading
              : translations[language].uploadImage}
          </Text>
        </TouchableOpacity>

        {prediction && (
          <View
            className="mt-4 max-w-md mx-auto p-4"
            style={{
              backgroundColor: "#ccc",
            }}
          >
            <Text
              className={`text-xl font-bold text-center uppercase mt-4 `}
              style={{
                color: textClass,
                fontSize: 24,
              }}
            >
              {translations[language].prediction}: {prediction}
            </Text>

            <Text
              className={`text-xl font-bold text-center uppercase mt-4 `}
              style={{
                color: textClass,
                fontSize: 24,
              }}
            >
              {translations[language].confidence}: {confidence} %
            </Text>

            <Text className="text-base text-base-content/80 text-center mt-2">
              {interpretation}
            </Text>
            {suggestions.length > 0 && (
              <View className="mt-4 max-w-md mx-auto mb-36">
                <Text className="text-base text-base-content">
                  {translations[language].suggestedActions}:
                </Text>
                {suggestions.map((suggestion, index) => (
                  <Text key={index} className="text-base text-base-content/80">
                    - {suggestion}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <Footer />
    </>
  );
}
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
    height: 200,
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
});
