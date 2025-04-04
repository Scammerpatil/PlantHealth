import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    moreInfo: "More Info",
    "Early Blight":
      "Early Blight is a fungal disease caused by *Alternaria solani*. It causes dark, concentric lesions on leaves, stems, and fruits. The disease thrives in warm, moist conditions and can spread quickly.",
    "Late Blight":
      "Late Blight is a severe fungal disease caused by *Phytophthora infestans*. It leads to large, dark lesions on leaves and stems, causing them to rot. It thrives in cool, moist conditions and spreads rapidly.",
  },
  hi: {
    captureUpload: "छवि कैप्चर या अपलोड करें",
    capture: "कैप्चर करें",
    upload: "अपलोड करें",
    uploadImage: "छवि अपलोड करें",
    uploading: "अपलोड हो रहा है...",
    prediction: "भविष्यवाणी",
    suggestedActions: "सुझाए गए कार्य",
    confidence: "विश्वास",
    moreInfo: "अधिक जानकारी",
    "प्रारंभिक गंज":
      "अर्ली ब्लाइट एक फंगल रोग है जो *Alternaria solani* द्वारा उत्पन्न होता है। यह पत्तियों, तनों और फलों पर अंधेरे, वलयाकार घाव पैदा करता है। यह रोग गर्म और नमी वाले वातावरण में फैलता है और तेजी से प्रसार करता है।",
    "लेट ब्लाइट":
      "लेट ब्लाइट एक गंभीर फंगल रोग है जो *Phytophthora infestans* द्वारा उत्पन्न होता है। यह पत्तियों और तनों पर बड़े, गहरे घाव उत्पन्न करता है, जिससे वे सड़ने लगते हैं। यह ठंडे और नमी वाले वातावरण में फैलता है और तेजी से बढ़ता है।",
  },
  mr: {
    captureUpload: "प्रतिमा कॅप्चर किंवा अपलोड करा",
    capture: "कॅप्चर करा",
    upload: "अपलोड करा",
    uploadImage: "प्रतिमा अपलोड करा",
    uploading: "अपलोड सुरू आहे...",
    prediction: "भविष्यवाणी",
    suggestedActions: "सूचित कृती",
    confidence: "विश्वास",
    moreInfo: "अधिक माहिती",
    "प्रारंभिक ब्लीट":
      "अर्ली ब्लाइट हे *Alternaria solani* नावाच्या फंगल रोगामुळे होतो. यामुळे पानांवर, ताडांवर आणि फळांवर गडद वलय असलेले मॅचेस होतात. हा रोग उष्ण आणि ओलसर हवामानात वाढतो.",
    "लेट ब्लीट":
      "लेट ब्लाइट हे *Phytophthora infestans* नावाच्या फंगल रोगामुळे होतो. यामुळे पानांवर आणि ताडांवर मोठ्या, गडद मॅचेस होतात, ज्यामुळे ते सडतात. हा रोग थंड आणि ओलसर हवामानात लवकर पसरणारा आहे.",
  },
  ta: {
    captureUpload: "படத்தை பிடிக்க அல்லது பதிவேற்ற",
    capture: "பிடிக்க",
    upload: "பதிவேற்ற",
    uploadImage: "படத்தை பதிவேற்ற",
    uploading: "பதிவேற்றுகிறது...",
    prediction: "முன்னறிவிப்பு",
    suggestedActions: "பரிந்துரைக்கப்பட்ட செயல்கள்",
    confidence: "நம்பிக்கை",
    moreInfo: "மேலும் தகவல்",
    "பிராரம்பிக பூஞ்சை":
      "எர்லி பிளைட் என்பது *Alternaria solani* என்ற பூஞ்சை நோயால் ஏற்படும் நோயாகும். இது பத்திரங்கள், கம்பி மற்றும் பழங்களில் கறுப்பு, வட்ட வடிவச் சிதைவுகளை ஏற்படுத்துகிறது. இது வெப்பமான, ஈரமான சூழலில் பரவுகிறது.",
    "இரவு பூஞ்சை":
      "லேட் பிளைட் என்பது *Phytophthora infestans* என்ற பூஞ்சை நோயால் ஏற்படும் தீவிரமான நோயாகும், இது பத்திரங்கள் மற்றும் கம்பிகளில் பெரிய, கருப்பு மேச்சுகள் ஏற்படுத்துகிறது, அதனால் அவை சிதைந்து போகின்றன. இது குளிர்ந்த மற்றும் ஈரமான சூழலில் விரைவில் பரவுகிறது.",
  },
  te: {
    captureUpload: "చిత్రాన్ని క్యాప్చర్ చేయండి లేదా అప్లోడ్ చేయండి",
    capture: "క్యాప్చర్",
    upload: "అప్లోడ్",
    uploadImage: "చిత్రాన్ని అప్లోడ్ చేయండి",
    uploading: "అప్లోడ్ జరుగుతోంది...",
    prediction: "అంచనా",
    suggestedActions: "సూచించిన చర్యలు",
    confidence: "అంచనా",
    moreInfo: "అంచనా",
    "ప్రారంభ బ్లైట్":
      "ప్రారంభ బ్లైట్ అనేది *Alternaria solani* అనే ఫంగస్ వ్యాధి ద్వారా టమోటా మరియు బంగాళా దుంప మొక్కలను ప్రభావితం చేస్తుంది. ఇది ఆకు, కాయ, మరియు కాండాలలో గఢంగా వలయాల లాంటి మచ్చలు ఏర్పడ causes. ఈ వ్యాధి వేడి, తేమ ఉన్న పరిస్థితుల్లో వేగంగా వ్యాపిస్తుంది.",
    "వాయిదా బ్లైట్":
      "వాయిదా బ్లైట్ అనేది *Phytophthora infestans* అనే ఫంగస్ వ్యాధి ద్వారా బంగాళా దుంప మరియు టమోటా మొక్కలను ప్రభావితం చేస్తుంది. ఇది ఆకు మరియు కాండాలలో పెద్ద, గాఢమైన మచ్చలను ఏర్పరచి వాటిని పాడుచేస్తుంది. ఈ వ్యాధి చల్లటి, తేమ ఉన్న పరిస్థితుల్లో వేగంగా వ్యాపిస్తుంది.",
  },
};

export default function CaptureScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [textClass, setTextClass] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [showModal, setShowModal] = useState<boolean>(false);

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

    fetchLanguage();
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
      setImage(result.assets[0]?.base64!);
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
            source={{ uri: `data:image/jpeg;base64,${image}` }}
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
                {translations[language].prediction}: {prediction}
              </Text>
              {(prediction === "Early Blight" ||
                prediction === "Late Blight" ||
                prediction === "प्रारंभिक गंज" ||
                prediction === "लेट ब्लाइट" ||
                prediction === "प्रारंभिक ब्लीट" ||
                prediction === "लेट ब्लीट" ||
                prediction === "பிராரம்பிக பூஞ்சை" ||
                prediction === "இரவு பூஞ்சை" ||
                prediction === "ప్రారంభ బ్లైట్" ||
                prediction === "వాయిదా బ్లైట్") && (
                <TouchableOpacity
                  style={styles.moreInfoButton}
                  onPress={() => setShowModal(true)}
                >
                  <Text className="text-white font-bold">
                    {translations[language].moreInfo}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text
              className={`text-xl font-bold text-center uppercase mt-4 `}
              style={{
                color: textClass,
                fontSize: 24,
              }}
            >
              {translations[language].confidence}: {confidence?.toFixed(2)} %
            </Text>

            <Text className="text-lg text-base-content/80 text-center mt-2">
              {interpretation}
            </Text>

            {suggestions.length > 0 && (
              <View className="mt-4 max-w-md mx-auto mb-36">
                <Text className="text-lg text-base-content">
                  {translations[language].suggestedActions}:
                </Text>
                {suggestions.map((suggestion, index) => (
                  <Text key={index} className="text-lg text-base-content/80">
                    - {suggestion}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text className="text-xl font-bold mb-4">
                {translations[language].moreInfo}: {prediction}
              </Text>
              <Text className="text-lg text-base-content/80 mb-4">
                {/* More Info */}
                {translations[language][prediction!]}
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
      </ScrollView>
      <Footer />
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 250,
    width: 250,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
    borderColor: "black",
    borderWidth: 1,
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
