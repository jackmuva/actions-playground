import { formatInputs, overrideInput } from "@/components/feature/action-tester";
import { SerializedConnectInputPicker } from "@/components/feature/serialized-connect-input-picker";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/workflowStore";
import { ConnectInputValue, SerializedConnectInput } from "@useparagon/connect";
import { CircleChevronLeft, TestTubeDiagonal } from "lucide-react";
import useSWR from "swr";
import { RunState } from "./output-sidebar";
import { useState } from "react";

export default function ActionInputSidebar() {
	const {
		setSelectedNode,
		selectedNode,
		paragonToken,
		nodes,
		setNodes,
		setTestOutput,
		setRunSidebar,
	} = useWorkflowStore((state) => state);
	const [runState, setRunState] = useState<RunState>(RunState.NORMAL);

	const setSelectedNodeInputValues = (inputValues: Record<string, ConnectInputValue>) => {
		if (!selectedNode) return;
		const newNodes = nodes;

		for (const node of newNodes) {
			if (node.id === selectedNode.id) {
				node.data.inputValues = inputValues;
			}
		}
		setNodes(newNodes);
	};

	const setSelectedNodeOutput = (data: string) => {
		if (!selectedNode) return;
		const newNodes = nodes;

		for (const node of newNodes) {
			if (node.id === selectedNode.id) {
				node.data.output = data;
			}
		}
		setNodes(newNodes);
		setTestOutput(true);
		setRunSidebar(true);
	};

	const { mutate: actionMutate } = useSWR(`run/action/${selectedNode?.id}`, async () => {
		setRunState(RunState.LOADING);
		if (!selectedNode) return;
		const response = await fetch(
			`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${paragonToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: selectedNode?.data.action!.name,
					parameters: formatInputs(selectedNode.data.inputValues),
				}),
			},
		);
		const data = await response.json();
		setSelectedNodeOutput(JSON.stringify(data, null, 2));
		setRunState(RunState.SUCCESS);
		setTimeout(() => {
			setRunState(RunState.NORMAL);
		}, 5000);
	},
		{
			revalidateOnMount: false,
			revalidateOnFocus: false,
		}
	);

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="w-full flex justify-between">
				<Button variant={"outline"} size={"sm"}
					onClick={() => setSelectedNode(null)}>
					<CircleChevronLeft size={12} />
					Back
				</Button>
				<Button variant={"outline"} size={"sm"}
					disabled={runState === RunState.NORMAL ? false : true}
					className={`${runState === RunState.LOADING ? "animate-pulse" :
						runState === RunState.SUCCESS ? "bg-green-400/30" : ""}`}
					onClick={() => actionMutate(undefined, { revalidate: true })}>
					<TestTubeDiagonal size={12} />
					{runState === RunState.NORMAL ? "Test Step" : runState}
				</Button>

			</div>
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
							value={selectedNode.data.inputValues[input.id]}
							onChange={(v) => {
								setSelectedNodeInputValues({ ...selectedNode.data.inputValues, [input.id]: v })
							}}
						/>
					)))
			) : (
				<></>
			)}
		</div>
	);
}
