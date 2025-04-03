import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Link } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Navbar = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");
  React.useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const language = (await AsyncStorage.getItem("language")) || "en";
        await AsyncStorage.setItem("language", language);
        setSelectedLanguage(language);
      } catch (error) {
        console.error("Error fetching language:", error);
      }
    };
    fetchLanguage();
  });
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    AsyncStorage.setItem("language", language).catch((error) =>
      console.error("Error saving language:", error)
    );
    setIsModalVisible(false);
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.navbarBrand}>
        <Link href="/">
          <Text className="font-bold text-green-600" style={{ fontSize: 24 }}>
            Plant Health
          </Text>
        </Link>
      </View>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={styles.languageButton}
      >
        <Text style={styles.languageText}>
          {selectedLanguage.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {isModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={handleLanguageChange}
                style={styles.picker}
              >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="हिन्दी (Hindi)" value="hi" />
                <Picker.Item label="मराठी (Marathi)" value="mr" />
                <Picker.Item label="தமிழ் (Tamil)" value="ta" />
                <Picker.Item label="తెలుగు (Telugu)" value="te" />
              </Picker>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  navbarBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
  navbarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  languageButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  languageText: {
    fontSize: 16,
    color: "#333",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  picker: {
    width: "100%",
    height: 30,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Navbar;
