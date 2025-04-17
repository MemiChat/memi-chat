import { getAgents } from "@/api/agents";
import { useAgentsStore } from "@/lib/store";
import { Agent } from "@/lib/types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import EditOrAddAgent from "./edit-add-agent";
import ViewAllAgents from "./view-all-agents";

export default function AgentSelection({ chatId }: { chatId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [agent, setAgent] = useState<Agent>({
    id: null,
    name: "",
    description: "",
    prompt: "",
    deleted: false,
  });
  const agentsStore = useAgentsStore();
  const { agents, setAgents } = agentsStore;

  useEffect(() => {
    getAgents().then((agents) => {
      agentsStore.setAgents(agents);
    });
  }, [chatId]);

  return (
    <BottomSheetView
      style={styles.bottomSheetContent}
      children={
        isEditing ? (
          <EditOrAddAgent
            setIsEditing={setIsEditing}
            agent={agent}
            setAgent={setAgent}
            agents={agents}
            setAgents={setAgents}
          />
        ) : (
          <ViewAllAgents
            setIsEditing={setIsEditing}
            agents={agents}
            setAgent={setAgent}
            setAgents={setAgents}
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 30,
    paddingBottom: 45,
  },
});
