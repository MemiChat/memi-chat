import { createAgent, generatePersona, updateAgent } from "@/api/agents";
import { useThemeColor } from "@/hooks/useThemeColor";
import ArrowRightIcon from "@/icons/arrow-right";
import LeaveIcon from "@/icons/leave";
import PlusIcon from "@/icons/plus";
import { PREBUILT_PERSONAS } from "@/lib/helper";
import { Agent } from "@/lib/types";
import { lightHapticFeedbackPress } from "@/lib/utils";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";

export default function EditOrAddAgent({
  setIsEditing,
  agent,
  setAgent,
  agents,
  setAgents,
}: {
  setIsEditing: (isEditing: boolean) => void;
  agent: Agent;
  setAgent: (agent: Agent) => void;
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
}) {
  const agentSelectionTitleText = useThemeColor({}, "agentSelectionTitleText");
  const agentSelectionDescriptionText = useThemeColor(
    {},
    "agentSelectionDescriptionText"
  );
  const editAgentInputBackground = useThemeColor(
    {},
    "editAgentInputBackground"
  );
  const color = useThemeColor({}, "text");
  const chatToolbarToolBorder = useThemeColor({}, "chatToolbarToolBorder");
  const [persona, setPersona] = useState("");
  const [error, setError] = useState({
    type: "",
    message: "",
  });
  const [personaGenerating, setPersonaGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function resetError() {
    setError({
      type: "",
      message: "",
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text
            style={{
              color: agentSelectionTitleText,
              fontSize: 14,
              fontWeight: 400,
            }}
          >
            {agent.id ? agent.name : "ADD NEW CONTACT"}
          </Text>
          {agent.id && (
            <Text
              style={{
                color: agentSelectionDescriptionText,
                fontSize: 12,
                fontWeight: 400,
              }}
            >
              CONTACT
            </Text>
          )}
          {error.type === "save" && (
            <Text style={styles.errorText}>{error.message}</Text>
          )}
        </View>
        <TouchableOpacity
          disabled={isSaving}
          onPress={async () => {
            setIsSaving(true);
            if (!isSaving) {
              if (agent.name && agent.description && agent.prompt) {
                if (agent.id) {
                  const updatedAgent = await updateAgent(agent.id, agent);
                  if (updatedAgent) {
                    setAgents(
                      agents.map((el) =>
                        el.id === agent.id ? updatedAgent : el
                      )
                    );
                    setIsEditing(false);
                  } else {
                    setError({
                      type: "save",
                      message: "Oops! Please try again.",
                    });
                    setIsSaving(false);
                  }
                } else {
                  const newAgent = await createAgent(agent);
                  if (newAgent) {
                    setAgents([...agents, newAgent]);
                    setIsEditing(false);
                  } else {
                    setError({
                      type: "save",
                      message: "Oops! Please try again.",
                    });
                    setIsSaving(false);
                  }
                }
              } else {
                setIsEditing(false);
              }
            }
          }}
          onPressIn={lightHapticFeedbackPress}
          style={[styles.leaveIconContainer]}
        >
          {isSaving ? (
            <ActivityIndicator color="white" size={18} />
          ) : (
            <LeaveIcon color="white" size={18} />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.labelText, { color }]}>Name</Text>
          <TextInput
            value={agent.name}
            onChangeText={(text) => setAgent({ ...agent, name: text })}
            style={[
              styles.textInput,
              { color, backgroundColor: editAgentInputBackground },
            ]}
            placeholderTextColor="gray"
            maxLength={18}
          />
        </View>
        {agent.prompt ? (
          <View style={styles.inputGroup}>
            <View style={styles.promptHeaderRow}>
              <Text style={[styles.labelText, { color }]}>
                How would you describe the person?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAgent({ ...agent, prompt: "" });
                }}
                onPressIn={lightHapticFeedbackPress}
              >
                <Text
                  style={[
                    styles.resetText,
                    { color: agentSelectionDescriptionText },
                  ]}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={agent.prompt}
              onChangeText={(text) => {
                setAgent({ ...agent, prompt: text });
              }}
              multiline={true}
              style={[
                styles.multilineTextInput,
                { color, backgroundColor: editAgentInputBackground },
              ]}
            />
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={[styles.labelText, { color }]}>
              How would you describe the person?
            </Text>
            <View style={styles.inputWithButtonContainer}>
              <TextInput
                value={persona}
                onChangeText={(text) => {
                  setPersona(text);
                  setAgent({ ...agent, description: text });
                }}
                style={[
                  styles.leftTextInput,
                  error.type === "persona" && styles.inputError,
                  { color, backgroundColor: editAgentInputBackground },
                ]}
                placeholderTextColor="gray"
                placeholder="One line description of the person"
              />
              <TouchableOpacity
                disabled={personaGenerating}
                onPressIn={lightHapticFeedbackPress}
                onPress={async () => {
                  if (!personaGenerating) {
                    setPersonaGenerating(true);
                    resetError();
                    const generatedPersona = await generatePersona(
                      `Name: ${agent.name}\nPersona: ${persona}`
                    );
                    if (generatedPersona) {
                      setAgent({ ...agent, prompt: generatedPersona });
                    } else {
                      setError({
                        type: "persona",
                        message: "Oops! Please try again.",
                      });
                    }
                    setPersonaGenerating(false);
                  }
                }}
                style={styles.arrowButton}
              >
                {personaGenerating ? (
                  <ActivityIndicator color="white" size={20} />
                ) : (
                  <ArrowRightIcon color="white" size={20} />
                )}
              </TouchableOpacity>
            </View>
            {error.type === "persona" && (
              <Text style={styles.personaErrorText}>{error.message}</Text>
            )}
            <View style={styles.personaTagsContainer}>
              {PREBUILT_PERSONAS.map((persona, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setPersona(persona);
                    let updatedAgent = { ...agent, description: persona };
                    if (agent.name === "") {
                      updatedAgent.name = persona;
                    }
                    setAgent(updatedAgent);
                  }}
                  onPressIn={lightHapticFeedbackPress}
                  style={[
                    styles.prebuiltPersonaContainer,
                    { borderColor: chatToolbarToolBorder },
                  ]}
                >
                  <PlusIcon color={agentSelectionDescriptionText} size={16} />
                  <Text
                    style={{
                      color: agentSelectionDescriptionText,
                      fontWeight: 600,
                      fontSize: 13.5,
                      marginTop: -1,
                    }}
                  >
                    {persona}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
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
    borderColor: "transparent",
  },
  prebuiltPersonaContainer: {
    width: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
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
  titleText: {
    fontSize: 14,
    fontWeight: 400,
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: 400,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    fontWeight: 400,
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: 400,
  },
  textInput: {
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 10,
  },
  promptHeaderRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  resetText: {
    fontSize: 14,
    fontWeight: 400,
  },
  multilineTextInput: {
    borderRadius: 6,
    height: 180,
    paddingHorizontal: 10,
    textAlignVertical: "top",
  },
  inputWithButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  leftTextInput: {
    flex: 1,
    backgroundColor: "#121212",
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "red",
  },
  arrowButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1480d9",
    height: 40,
    paddingHorizontal: 10,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  personaErrorText: {
    color: "red",
    fontSize: 12,
    fontWeight: 400,
    marginTop: -3,
  },
  personaTagsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
  },
});
