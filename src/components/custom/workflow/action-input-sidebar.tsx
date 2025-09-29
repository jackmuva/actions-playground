import { overrideInput } from "@/components/feature/action-tester";
import { SerializedConnectInputPicker } from "@/components/feature/serialized-connect-input-picker";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/workflowStore";
import { ConnectInputValue, SerializedConnectInput } from "@useparagon/connect";
import { CircleChevronLeft } from "lucide-react";
import { useState } from "react";

export default function ActionInputSidebar() {
	const { setSelectedNode, selectedNode } = useWorkflowStore((state) => state);
	const [inputValues, setInputValues] = useState<Record<string, ConnectInputValue>>({});

	return (
		<div className="w-full flex flex-col gap-4">
			<Button variant={"outline"} size={"sm"}
				className="w-fit"
				onClick={() => setSelectedNode(null)}>
				<CircleChevronLeft size={12} />
				Back
			</Button>
			{selectedNode !== null && selectedNode.data.action ? (
				selectedNode.data.action.inputs?.length === 0 ? (
					<div className="font-bold italic">
						No inputs necessary
					</div>
				) : (
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
					)))
			) : (
				<></>
			)}
		</div>
	);
}
