import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/chat/start`);
      if (!response.ok) throw new Error("Failed to fetch chat");

      const data = await response.json();
      setMessages([{ text: data.message, sender: "bot" }]);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchChat();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8081/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages((prev) => [...prev, { text: data.message, sender: "bot" }]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <View className="flex-1 bg-base-100 p-4" data-theme="forest">
        <Text className="text-2xl font-bold text-success mb-4 uppercase text-center">
          Chat Bot <Ionicons name="chatbubbles" size={24} />
        </Text>

        <ScrollView style={{ flex: 1, marginBottom: 10 }}>
          {messages.map((msg, index) => (
            <View
              key={index}
              className={`chat ${
                msg.sender === "user" ? "chat-end" : "chat-start"
              }`}
            >
              <View
                className={`chat-bubble ${
                  msg.sender === "user"
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                <Text>{msg.text}</Text>
              </View>
            </View>
          ))}
          {loading && (
            <View className="chat chat-start">
              <View className="chat-bubble loading loading-dots loading-md bg-gray-300" />
            </View>
          )}
        </ScrollView>

        <View className="flex-row items-center border-t border-base p-2 mb-16">
          <TextInput
            className="input input-md input-bordered input-success w-full"
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              marginLeft: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={sendMessage}
            disabled={loading}
          >
            <Text className="text-white font-bold">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Footer />
    </>
  );
}
