import React, { useState } from "react";
import { deleteAgent } from "@/api/agents";
import { useThemeColor } from "@/hooks/useThemeColor";
import DeleteIcon from "@/icons/delete";
import PencilIcon from "@/icons/pencil";
import PlusIcon from "@/icons/plus";
import { useAgentsStore } from "@/lib/store";
import { Agent } from "@/lib/types";
import { lightHapticFeedbackPress } from "@/lib/utils";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Popover from "react-native-popover-view";
import ChevronRightIcon from "@/icons/chevron-right";
import BrainIcon from "@/icons/brain";
import BoltIcon from "@/icons/bolt";
import CpuIcon from "@/icons/cpu";

const selectableAIs = [
  {
    value: "Think More",
    icon: BrainIcon,
  },
  {
    value: "Think Fast",
    icon: BoltIcon,
  },
  {
    value: "Default",
    icon: CpuIcon,
  },
];

const renderRightActions = (
  progress: Animated.AnimatedInterpolation<number>,
  dragX: Animated.AnimatedInterpolation<number>,
  onEdit?: () => void,
  onDelete?: () => void
) => {
  const opacity = dragX.interpolate({
    inputRange: [-120, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[{ display: "flex", flexDirection: "row", opacity }]}>
      <TouchableOpacity
        onPress={onEdit}
        onPressIn={lightHapticFeedbackPress}
        style={styles.editButton}
      >
        <PencilIcon color="white" size={24} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDelete}
        onPressIn={lightHapticFeedbackPress}
        style={styles.deleteButton}
      >
        <DeleteIcon color="white" size={24} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ViewAllAgents({
  setIsEditing,
  agents,
  setAgent,
  setAgents,
}: {
  setIsEditing: (isEditing: boolean) => void;
  agents: Agent[];
  setAgent: (agent: Agent) => void;
  setAgents: (agents: Agent[]) => void;
}) {
  const agentSelectionTitleText = useThemeColor({}, "agentSelectionTitleText");
  const agentSelectionDescriptionText = useThemeColor(
    {},
    "agentSelectionDescriptionText"
  );
  const agentSelectionRowBg = useThemeColor({}, "agentSelectionRowBg");
  const agentSelectionRowDescription = useThemeColor(
    {},
    "agentSelectionRowDescription"
  );
  const color = useThemeColor({}, "text");
  const messageBackground = useThemeColor({}, "messageBackground");
  const agentsStore = useAgentsStore();
  const [showPopover, setShowPopover] = useState(false);

  function SelectedAIIcon() {
    const selectedAI = selectableAIs.find(
      (ai) => ai.value === agentsStore.selectedAI
    );
    return selectedAI ? (
      <selectedAI.icon color={color} size={20} style={{ marginRight: 2 }} />
    ) : null;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text
              style={[styles.headerTitle, { color: agentSelectionTitleText }]}
            >
              Response Preferences
            </Text>
            <Text
              style={[
                styles.headerDescription,
                { color: agentSelectionDescriptionText },
              ]}
            >
              Enabling a contact allows the AI to use memory feature. Image
              generation is not supported in group chats.
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.agentRowContainer,
            { backgroundColor: agentSelectionRowBg },
          ]}
        >
          <View style={styles.agentRowHeader}>
            <View style={{ flexDirection: "column", gap: 2 }}>
              <Text style={{ color }}>Talk More</Text>
              <Text
                style={[
                  styles.headerDescription,
                  { color: agentSelectionRowDescription },
                ]}
                numberOfLines={1}
              >
                AI will give longer responses.
              </Text>
            </View>
            <Switch
              value={agentsStore.talkMore}
              onValueChange={() => {
                agentsStore.setTalkMore(!agentsStore.talkMore);
              }}
            />
          </View>
        </View>
        <View
          style={[
            styles.agentRowContainer,
            { backgroundColor: agentSelectionRowBg },
          ]}
        >
          <View style={styles.agentRowHeader}>
            <View style={{ flexDirection: "column", gap: 2 }}>
              <Text style={{ color }}>AI</Text>
              <Text
                style={[
                  styles.headerDescription,
                  { color: agentSelectionRowDescription },
                ]}
                numberOfLines={1}
              >
                Choose AI you want to use.
              </Text>
            </View>
            <Popover
              from={
                <TouchableOpacity
                  style={styles.popoverOpen}
                  onPressIn={lightHapticFeedbackPress}
                  onPress={() => setShowPopover(!showPopover)}
                >
                  <SelectedAIIcon />
                  <Text style={{ color, fontWeight: 500 }}>
                    {agentsStore.selectedAI}
                  </Text>
                  <ChevronRightIcon
                    color={color}
                    size={16}
                    style={{
                      marginTop: 0.5,
                    }}
                  />
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
              {selectableAIs.map((ai) => (
                <TouchableOpacity
                  key={ai.value}
                  style={styles.popoverItem}
                  onPress={() => {
                    agentsStore.setSelectedAI(ai.value);
                    setShowPopover(false);
                  }}
                >
                  <ai.icon color={color} size={22} />
                  <Text style={{ color, fontWeight: 500, fontSize: 14 }}>
                    {ai.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </Popover>
          </View>
        </View>
        <View style={[styles.headerContainer, { paddingTop: 5 }]}>
          <View style={styles.headerTextContainer}>
            <Text
              style={[styles.headerTitle, { color: agentSelectionTitleText }]}
            >
              Your Contacts
            </Text>
            <Text
              style={[
                styles.headerDescription,
                { color: agentSelectionDescriptionText },
              ]}
            >
              Select maximum of 3 people.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setAgent({
                id: null,
                name: "",
                description: "",
                prompt: "",
                deleted: false,
              });
              setIsEditing(true);
            }}
            onPressIn={lightHapticFeedbackPress}
            style={styles.plusIconContainer}
          >
            <PlusIcon color="white" size={18} />
          </TouchableOpacity>
        </View>
        {agents.map((agent, ind) => (
          <React.Fragment key={ind}>
            <Swipeable
              renderRightActions={(progress, dragX) =>
                renderRightActions(
                  progress,
                  dragX,
                  () => {
                    setAgent(agent);
                    setIsEditing(true);
                  },
                  () => {
                    if (agent.id) {
                      setAgents(agents.filter((el) => el.id !== agent.id));
                      deleteAgent(agent.id);
                    }
                  }
                )
              }
            >
              <View
                style={[
                  styles.agentRowContainer,
                  { backgroundColor: agentSelectionRowBg },
                ]}
              >
                <View style={styles.agentRowHeader}>
                  <View style={{ flexDirection: "column", gap: 2 }}>
                    <Text style={{ color: color }}>{agent.name}</Text>
                    <Text
                      style={[
                        styles.headerDescription,
                        {
                          color: agentSelectionRowDescription,
                          maxWidth: 210,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {agent.description}
                    </Text>
                  </View>
                  <Switch
                    value={agentsStore.selectedAgents.some(
                      (a) => a.id === agent.id
                    )}
                    onValueChange={() => {
                      agentsStore.selectedAgents.some((a) => a.id === agent.id)
                        ? agentsStore.removeSelectedAgent(agent)
                        : agentsStore.selectedAgents.length < 3
                        ? agentsStore.addSelectedAgent(agent)
                        : null;
                    }}
                  />
                </View>
              </View>
            </Swipeable>
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  plusIconContainer: {
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: "100%",
    padding: 5.55,
    marginBottom: 2.82,
    backgroundColor: "#24bf4e",
  },
  leaveIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 9,
    paddingVertical: 5.55,
    paddingLeft: 7.5,
    paddingRight: 5.55,
    marginBottom: 2.82,
    backgroundColor: "#24bf4e",
  },
  prebuiltPersonaContainer: {
    width: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "400",
  },
  headerDescription: {
    fontSize: 12.5,
    fontWeight: "400",
  },
  agentRowContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  agentRowHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#40a3f5",
    height: "100%",
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  deleteButton: {
    backgroundColor: "#d41111",
    height: "100%",
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  popoverContentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popover: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  popoverOpen: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  popoverItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
});
