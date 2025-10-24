"use client";
import { Button } from "@/components/ui/button";
import { useWorkflowStore, WorkflowNode } from "@/store/workflowStore";
import { Box, CircleChevronRight, Logs, Waypoints } from "lucide-react";
import { formatInputs } from "@/components/feature/action-tester";
import { SLACK_APP_MENTION_TEST_PAYLOAD } from "./trigger-input-sidebar";
import { RunSidebar } from "./run-sidebar";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

enum DeployState {
	PENDING = "Pending",
	FAILED = "Failed",
	SUCCESS = "Deployed",
	NORMAL = "Deploy",
	REDEPLOY = "Re-deploy",
};

export enum RunState {
	SUCCESS = "Finished",
	LOADING = "Loading",
	NORMAL = "Test Workflow",
}

export const OutputSidebar = () => {
	const {
		setNodes,
		nodes,
		edges,
		paragonToken,
		deployed,
		setDeployed,
		setRunSidebar,
		runSidebar,
		setTestOutput,
	} = useWorkflowStore((state) => state);
	const [deployState, setDeployState] = useState<DeployState>(deployed ? DeployState.REDEPLOY : DeployState.NORMAL);
	const [runState, setRunState] = useState<RunState>(RunState.NORMAL);

	const setSelectedNodeOutput = (selectedNode: WorkflowNode, data: string) => {
		const newNodes = nodes;

		for (const node of newNodes) {
			if (node.id === selectedNode.id) {
				node.data.output = data;
			}
		}
		setNodes(newNodes);
		setRunSidebar(true);
	};

	const deployWf = async () => {
		setDeployState(DeployState.PENDING);
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
		if (!res.ok) {
			setDeployed(false);
			setDeployState(DeployState.FAILED);
			throw Error(await res.json());
		} else {
			setDeployed(true);
			setDeployState(DeployState.SUCCESS);
		}
		setTimeout(() => {
			if (!deployed) {
				setDeployState(DeployState.NORMAL);
			} else {
				setDeployState(DeployState.REDEPLOY);
			}
		}, 5000);
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
		setRunState(RunState.LOADING);
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
		setTestOutput(true);
		setRunSidebar(true);
		setRunState(RunState.SUCCESS);
		setTimeout(() => {
			setRunState(RunState.NORMAL);
		}, 5000);

	}

	return (
		<div className="w-fit h-fit overflow-y-auto absolute top-24 right-0 px-2
			flex flex-col items-end bg-background rounded-sm">
			<div className="flex gap-2 mb-2 pt-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button size={"sm"} variant={"outline"}
							onClick={() => testWorkflow()}
							disabled={(nodes[0].data.trigger && runState === RunState.NORMAL) ? false : true}
							className={`${runState === RunState.LOADING ? "animate-pulse" :
								runState === RunState.SUCCESS ? "bg-green-400/30" : ""}`}
						>
							<Waypoints size={12} />
							{runState}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<strong>Test Workflow</strong> to run the entire workflow using test trigger data and data from your inputs.
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button size={"sm"} variant={"outline"}
							onClick={() => deployWf()}
							disabled={(nodes[0].data.trigger && (deployState !== DeployState.PENDING && deployState !== DeployState.SUCCESS && deployState !== DeployState.FAILED)) ? false : true}
							className={`${deployState === DeployState.PENDING ? "animate-pulse" :
								deployState === DeployState.FAILED ? "bg-red-400/30" :
									deployState === DeployState.SUCCESS ? "bg-green-400/30" : ""}`}

						>
							<Box size={12} />
							{deployState}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<strong>Deploy</strong> your workflow to see your workflow run live based off your trigger.
						<br /><br />
						(i.e. For the App Mention Trigger, mention @Actions_Playground in a <br />
						public channel in your connected Slack workspace)
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant={"outline"} size={"sm"}
							onClick={() => setRunSidebar(!runSidebar)} >
							{runSidebar ? <CircleChevronRight size={12} /> : <Logs size={20} />}
							Workflow Runs
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						Test and deployed workflow runs are both found in <strong>Workflow Runs</strong>.
					</TooltipContent>
				</Tooltip>
			</div>
			{runSidebar && <RunSidebar />}
		</div>
	);
}
