import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import SendIcon from "@/icons/send";
import PhotoIcon from "@/icons/photo";
import { useThemeColor } from "@/hooks/useThemeColor";
import { lightHapticFeedbackPress } from "@/lib/utils";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as DocumentPicker from "expo-document-picker";
import { useAgentsStore, useChatsStore } from "@/lib/store";
import { useState } from "react";
import { uploadFile, uploadMultipartFile } from "@/api/files";
import { randomUUID } from "expo-crypto";
import { addChatMessage, createChat } from "@/api/chat";
import { useRouter } from "expo-router";
import {
  DOCUMENT_UPLOAD_TYPES,
  USER_ROLE,
  VIDEO_UPLOAD_TYPES,
} from "@/lib/helper";
import PlusIcon from "@/icons/plus";
import UsersIcon from "@/icons/users";
import Popover from "react-native-popover-view";
import VideoIcon from "@/icons/video";
import DocumentIcon from "@/icons/document";
import StopIcon from "@/icons/stop";

export default function ChatToolbar({
  onSendPress,
  chatId = "",
  handleAgentSelectionOpen,
  hideKeyboard,
  abortStream,
}: {
  onSendPress: () => void;
  chatId?: string;
  handleAgentSelectionOpen: () => void;
  hideKeyboard: () => void;
  abortStream: () => void;
}) {
  const color = useThemeColor({}, "text");
  const messageBackground = useThemeColor({}, "messageBackground");
  const store = useChatsStore();
  const [fileUploading, setFileUploading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const router = useRouter();
  const agentsStore = useAgentsStore();
  const selectedAgents = agentsStore.selectedAgents;

  const pickImage = async () => {
    setFileUploading(true);
    store.setSendLoading(chatId, true);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.9,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      const resizedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.WEBP,
          base64: true,
        }
      );
      const base64Data = resizedImage.base64;
      if (base64Data) {
        const fileUrl = await uploadFile(base64Data, "image/webp");
        if (fileUrl) {
          const newChatId = chatId ? chatId : randomUUID();
          const newUserMessage = {
            id: randomUUID(),
            chatId: newChatId,
            role: USER_ROLE,
            text: `![image](${fileUrl})`,
          };
          if (!chatId) {
            store.addChat({
              id: newChatId,
              title: "Image Editing",
            });
            store.addMessage(newUserMessage);
            const chatCreated = await createChat("Image Editing", newChatId);
            const messageAdded = await addChatMessage(newUserMessage);
            if (chatCreated && messageAdded) {
              router.push(`/chat/${newChatId}`);
            } else {
              store.deleteChat(newChatId);
              Alert.alert("Error", "Failed to upload image");
            }
          } else {
            store.addMessage(newUserMessage);
          }
        } else {
          Alert.alert("Error", "Failed to upload image");
        }
      } else {
        Alert.alert("Error", "Failed to upload image");
      }
    }

    setFileUploading(false);
    store.setSendLoading(chatId, false);
  };

  const pickDocument = async () => {
    setFileUploading(true);
    store.setSendLoading(chatId, true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: DOCUMENT_UPLOAD_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled) {
        const { uri, name, mimeType, size } = result.assets[0];
        if (!size || !mimeType) {
          Alert.alert("Error", "Failed to pick document");
          return;
        }

        if (size > 20 * 1024 * 1024) {
          Alert.alert("Error", "Document size exceeds 20MB");
          return;
        }

        const fileUrl = await uploadMultipartFile(uri, mimeType);

        if (fileUrl) {
          const newChatId = chatId ? chatId : randomUUID();
          const newUserMessage = {
            id: randomUUID(),
            chatId: newChatId,
            role: USER_ROLE,
            text: `[${name}](${fileUrl})`,
          };
          if (!chatId) {
            store.addChat({ id: newChatId, title: "Document Upload" });
            store.addMessage(newUserMessage);
            const chatCreated = await createChat("Document Upload", newChatId);
            const messageAdded = await addChatMessage(newUserMessage);
            if (chatCreated && messageAdded) {
              router.push(`/chat/${newChatId}`);
            } else {
              store.deleteChat(newChatId);
              Alert.alert("Error", "Failed to upload document");
            }
          } else {
            store.addMessage(newUserMessage);
          }
        } else {
          Alert.alert("Error", "Failed to upload document");
        }
      }
    } catch (error) {
      console.error("Document picking error:", error);
      Alert.alert("Error", "Failed to pick document");
    } finally {
      setFileUploading(false);
      store.setSendLoading(chatId, false);
      setShowPopover(false);
    }
  };

  const pickVideo = async () => {
    setFileUploading(true);
    store.setSendLoading(chatId, true);

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        const video = result.assets[0];
        const { uri, fileName, mimeType, fileSize } = video;
        if (!uri || !mimeType || !VIDEO_UPLOAD_TYPES.includes(mimeType)) {
          Alert.alert("Error", "Failed to pick video");
          return;
        }
        if (fileSize && fileSize > 20 * 1024 * 1024) {
          Alert.alert("Error", "Video size exceeds 20MB");
          return;
        }

        const fileUrl = await uploadMultipartFile(uri, mimeType);
        let name = "Video";
        if (fileName) {
          name = fileName;
        }

        if (fileUrl) {
          const newChatId = chatId ? chatId : randomUUID();
          const newUserMessage = {
            id: randomUUID(),
            chatId: newChatId,
            role: USER_ROLE,
            text: `![${name}](${fileUrl})`,
          };

          if (!chatId) {
            store.addChat({ id: newChatId, title: "Video Upload" });
            store.addMessage(newUserMessage);
            const chatCreated = await createChat("Video Upload", newChatId);
            const messageAdded = await addChatMessage(newUserMessage);
            if (chatCreated && messageAdded) {
              router.push(`/chat/${newChatId}`);
            } else {
              store.deleteChat(newChatId);
              Alert.alert("Error", "Failed to upload video");
            }
          } else {
            store.addMessage(newUserMessage);
          }
        } else {
          Alert.alert("Error", "Failed to upload video");
        }
      }
    } catch (error) {
      console.error("Video picking error:", error);
      Alert.alert("Error", "Failed to pick video");
    } finally {
      setFileUploading(false);
      store.setSendLoading(chatId, false);
      setShowPopover(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Popover
          from={
            <TouchableOpacity
              onPress={() => setShowPopover(true)}
              onPressIn={lightHapticFeedbackPress}
              style={[styles.plusIconContainer]}
            >
              <PlusIcon color={fileUploading ? "gray" : "white"} size={18} />
            </TouchableOpacity>
          }
          arrowSize={{
            width: -3,
            height: -3,
          }}
          popoverStyle={[
            styles.popover,
            { backgroundColor: messageBackground },
          ]}
          isVisible={showPopover}
          onRequestClose={() => setShowPopover(false)}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              paddingVertical: 6,
              paddingHorizontal: 9,
            }}
          >
            <TouchableOpacity
              onPress={pickDocument}
              onPressIn={lightHapticFeedbackPress}
              style={styles.popoverContentContainer}
            >
              <DocumentIcon color={fileUploading ? "gray" : color} size={21} />
              <Text
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: fileUploading ? "gray" : color,
                }}
              >
                Add Document
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickVideo}
              onPressIn={lightHapticFeedbackPress}
              style={styles.popoverContentContainer}
            >
              <VideoIcon color={fileUploading ? "gray" : color} size={21} />
              <Text
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: fileUploading ? "gray" : color,
                }}
              >
                Add Video
              </Text>
            </TouchableOpacity>
          </View>
        </Popover>
        <TouchableOpacity
          onPress={() => {
            handleAgentSelectionOpen();
            hideKeyboard();
          }}
          onPressIn={lightHapticFeedbackPress}
          style={[
            styles.agentSelectionContainer,
            {
              borderColor:
                selectedAgents.length > 0
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.15)",
              backgroundColor:
                selectedAgents.length > 0
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.15)",
            },
          ]}
        >
          <UsersIcon color={fileUploading ? "gray" : "white"} size={17.5} />
          <Text
            style={{
              color: fileUploading ? "gray" : "white",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Group Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={fileUploading ? undefined : pickImage}
          onPressIn={lightHapticFeedbackPress}
          style={[styles.addPhotoContainer]}
        >
          <PhotoIcon color={fileUploading ? "gray" : "white"} size={18} />
          <Text
            style={{
              color: fileUploading ? "gray" : "white",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Photo
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={
          store.getSendLoading(chatId)
            ? undefined
            : store.getIsStreaming(chatId)
            ? abortStream
            : onSendPress
        }
        onPressIn={lightHapticFeedbackPress}
      >
        <View style={[styles.sendIconContainer]}>
          {store.getSendLoading(chatId) ? (
            <ActivityIndicator
              size={23}
              color="white"
              style={{
                marginRight: 1,
                marginBottom: 0.5,
                marginTop: 0.5,
              }}
            />
          ) : store.getIsStreaming(chatId) ? (
            <StopIcon style={styles.sendIcon} color="white" />
          ) : (
            <SendIcon style={styles.sendIcon} color="white" />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  plusIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: "100%",
    padding: 5.55,
    marginBottom: 2.82,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  addPhotoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 2.82,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  agentSelectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 2.82,
  },
  sendIconContainer: {
    alignSelf: "flex-end",
    borderRadius: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 9.5,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  sendIcon: {
    height: 19.5,
    width: 19.5,
  },
  popoverContentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  popover: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: -5,
  },
});
