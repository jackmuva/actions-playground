import { formatInputs } from "@/components/feature/action-tester";
import { createParagonToken } from "@/lib/auth";
import { WorkflowNode } from "@/store/workflowStore";
import { Edge } from "@xyflow/react";

const setSelectedNodeOutput = (nodes: WorkflowNode[], selectedNode: WorkflowNode, data: string): WorkflowNode[] => {
	const newNodes = nodes;

	for (const node of newNodes) {
		if (node.id === selectedNode.id) {
			node.data.output = data;
		}
	}
	return newNodes;
};

const performAction = async (node: WorkflowNode, userId: string): Promise<string | null> => {
	const paragonToken = await createParagonToken(userId);
	if (node.id === "trigger") {
		return null;
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
				parameters: formatInputs(node?.data.inputValues!),
			}),
		},
	);
	const data = await response.json();
	return JSON.stringify(data, null, 2);
}

export const runWorkflow = async (nodes: WorkflowNode[], edges: Edge[], userId: string, triggerInput: string): Promise<WorkflowNode[]> => {
	let newNodes: WorkflowNode[] = nodes;
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
		//TODO:not sure if this is best with different types of triggers
		let res: string = await performAction(selectedNode, userId) ?? triggerInput;
		newNodes = setSelectedNodeOutput(nodes, selectedNode, res);
		if (edgeMap.has(nodeId)) {
			for (const id of edgeMap.get(nodeId)!) {
				queue.push(id);
			}
		}
	}
	return newNodes;
}
