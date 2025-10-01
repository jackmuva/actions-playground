"use client";
import { Button } from "@/components/ui/button";
import { useWorkflowStore, WorkflowNode } from "@/store/workflowStore";
import { Box, CircleChevronRight, ClipboardCopy, Waypoints } from "lucide-react";
import { OutputTile } from "./output-tile";
import { formatInputs } from "@/components/feature/action-tester";
import { SLACK_APP_MENTION_TEST_PAYLOAD } from "./trigger-input-sidebar";
import useSWR from "swr";
import { Workflow } from "@/db/schema";

export const OutputSidebar = () => {
	const {
		outputSidebar,
		setOutputSidebar,
		setNodes,
		nodes,
		edges,
		paragonToken,
		deployed,
		setDeployed,
	} = useWorkflowStore((state) => state);

	const setSelectedNodeOutput = (selectedNode: WorkflowNode, data: string) => {
		const newNodes = nodes;

		for (const node of newNodes) {
			if (node.id === selectedNode.id) {
				node.data.output = data;
			}
		}
		setNodes(newNodes);
		setOutputSidebar(true);
	};

	const deployWf = async () => {
		const res = await fetch(
			`${window.document.location.origin}/api/workflow/deploy`,
			{
				method: "POST",
				body: JSON.stringify({
					nodes: nodes,
					edges: edges
				}),
			}
		);
		if (res.ok) {
			setDeployed(true);
		} else {
			throw Error(await res.json());
		}
	}

	//TODO:Loading state when workflow is being run
	const performAction = async (node: WorkflowNode): Promise<string> => {
		if (node.data.trigger && node.data.trigger.name === "SLACK_APP_MENTION_TRIGGER") {
			return SLACK_APP_MENTION_TEST_PAYLOAD;
		}
		const response = await fetch(
			`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${paragonToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: node.data.action!.name,
					parameters: formatInputs(node.data.inputValues),
				}),
			},
		);
		const data = await response.json();
		return JSON.stringify(data, null, 2);
	}

	const testWorkflow = async () => {
		const edgeMap: Map<string, Array<string>> = new Map();
		const nodeMap: Map<string, WorkflowNode> = new Map();
		const queue: Array<string> = [];

		for (const edge of edges) {
			if (edgeMap.has(edge.source)) {
				edgeMap.set(edge.source, [...edgeMap.get(edge.source)!, edge.target]);
			} else {
				edgeMap.set(edge.source, [edge.target]);
			}
		}
		for (const node of nodes) {
			nodeMap.set(node.id, node);
		}
		queue.push('trigger');
		while (queue.length > 0) {
			const nodeId: string = queue.shift() ?? "";
			const selectedNode: WorkflowNode = nodeMap.get(nodeId)!;
			const res: string = await performAction(selectedNode)
			setSelectedNodeOutput(selectedNode, res);
			if (edgeMap.has(nodeId)) {
				for (const id of edgeMap.get(nodeId)!) {
					queue.push(id);
				}
			}
		}
	}

	const { data: deployedWf, isLoading: deployedWfLoading } = useSWR(deployed ? `deployed/workflow` : null, async () => {
		console.log("refreshing data");
		const req = await fetch(
			`${window.document.location.origin}/api/workflow/deploy`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
		const res: { status: number, data: Workflow } = await req.json();
		if (!req.ok) throw Error(res.data.toString());
		console.log("data: ", res);
		setNodes(res.data.nodes);
	},
		{
			revalidateOnFocus: true,
			revalidateOnMount: false,
			// refreshInterval: 10000,
		}
	);


	return (
		<div className="w-fit max-h-full overflow-y-auto absolute top-24 right-0 px-2
			flex flex-col items-end">
			<div className="flex gap-2 mb-2 pt-2">
				<Button size={"sm"} variant={"outline"}
					onClick={() => testWorkflow()}
					disabled={nodes[0].data.trigger ? false : true}>
					<Waypoints size={12} />
					Test Workflow
				</Button>
				<Button size={"sm"} variant={"outline"}
					className={deployed ? "bg-green-400/30 dark:bg-green-400/30" : ""}
					onClick={() => deployWf()}
					disabled={nodes[0].data.trigger ? false : true}>
					<Box size={12} />
					{deployed ? "Re-Deploy" : "Deploy"}
				</Button>
				<Button variant={"outline"} size={"sm"}
					onClick={() => setOutputSidebar(!outputSidebar)} >
					{outputSidebar ? <CircleChevronRight size={20} /> : <ClipboardCopy size={20} />}
					{outputSidebar ? "Collapse" : "Output"}
				</Button>
			</div>
			{outputSidebar && <div className="w-96 max-h-full overflow-y-auto flex flex-col relative">
				<div className="w-full flex justify-between items-center">
					<h1 className="font-semibold ">
						Workflow Outputs
					</h1>
				</div>
				{nodes.map((node) => {
					if (!node.data.icon) return;
					return (
						<OutputTile node={node} key={node.id} />
					);
				})}
			</div>}
		</div>
	);
}
