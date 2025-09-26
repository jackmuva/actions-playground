import { overrideInput } from "@/components/feature/action-tester";
import { SerializedConnectInputPicker } from "@/components/feature/serialized-connect-input-picker";
import { useWorkflowStore } from "@/store/workflowStore";
import { ConnectInputValue, SerializedConnectInput } from "@useparagon/connect";
import { useState } from "react";

export default function ActionInputSidebar() {
	const { selectedNode } = useWorkflowStore((state) => state);
	const [inputValues, setInputValues] = useState<Record<string, ConnectInputValue>>({});

	return (
		selectedNode !== null && selectedNode.data.action ? (
			selectedNode.data.action.inputs?.map((input: SerializedConnectInput) => (
				<SerializedConnectInputPicker
					key={input.id}
					integration={selectedNode.data.integration!}
					field={overrideInput(selectedNode.data.integration!, input)}
					value={inputValues[input.id]}
					onChange={(v) =>
						setInputValues((prev) => ({ ...prev, [input.id]: v }))
					}
				/>
			)
			)) : (<></>)
	);
}
