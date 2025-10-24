import { Button } from "@/components/ui/button"
import useParagon from "@/lib/hooks";
import { useWorkflowStore, WorkflowNode } from "@/store/workflowStore";
import { CircleChevronLeft, CirclePlus, TestTubeDiagonal } from "lucide-react"
import useSWR from "swr";
import { RunState } from "./output-sidebar";
import { useState } from "react";

export const SLACK_ICON = "https://cdn.useparagon.com/latest/dashboard/public/integrations/slack.svg";

export default function TriggerInputSidebar() {
	const { nodes,
		selectedNode,
		paragonToken,
		setTestOutput,
		setNodes,
		setSelectedNode,
		setRunSidebar } = useWorkflowStore((state) => state);
	const { paragonConnect } = useParagon(paragonToken ?? "");
	const [runState, setRunState] = useState<RunState>(RunState.NORMAL);

	const { data: user } = useSWR(`user`, async () => {
		const response = await fetch(
			`https://api.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/sdk/me`,
			{
				headers: {
					Authorization: `Bearer ${paragonToken}`,
				},
			},
		);
		const data = await response.json();
		return data;
	});

	const setSelectedNodeData = (data: string) => {
		setRunState(RunState.LOADING);
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
		setRunState(RunState.SUCCESS);
		setTimeout(() => {
			setRunState(RunState.NORMAL);
		}, 5000);
	};

	const updateTrigger = (name: string) => {
		const newNodes: Array<WorkflowNode> = nodes.filter((node) => node.id !== "trigger");;
		const triggerNode: WorkflowNode = nodes.filter((node) => node.id === "trigger")[0];
		const newTriggerNode = {
			...triggerNode,
			type: "triggerNode" as const,
			data: {
				icon: SLACK_ICON,
				integration: "slack",
				trigger: {
					name: name,
					title: "Slack App Mentioned"
				},
				inputValues: {}
			}
		};
		setNodes([newTriggerNode, ...newNodes]);
		setSelectedNode("trigger");
	}

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="w-full flex justify-between items-center">
				<Button variant={"outline"} size={"sm"}
					onClick={() => setSelectedNode(null)}>
					<CircleChevronLeft size={12} />
					Back
				</Button>
				{/* TODO:Replace the onclick with switch statement 
						when more triggers are implemented */}
				{selectedNode && selectedNode.data.trigger &&
					<Button variant={"outline"} size={"sm"}
						disabled={runState === RunState.NORMAL ? false : true}
						className={`${runState === RunState.LOADING ? "animate-pulse" :
							runState === RunState.SUCCESS ? "bg-green-400/30" : ""}`}
						onClick={() => setSelectedNodeData(SLACK_APP_MENTION_TEST_PAYLOAD)}>
						<TestTubeDiagonal size={12} />
						{runState === RunState.NORMAL ? "Test Step" : runState}
					</Button>
				}
			</div>

			<div className="border rounded-sm p-4 flex justify-between items-center">
				<div className="flex items-center overflow-hidden">
					<img alt="integration icon"
						src={SLACK_ICON}
						className="w-5 h-5 mr-1" />
					Slack App Mention
				</div>
				<Button variant={"outline"} size={"sm"}
					className="h-fit py-1"
					onClick={() => {
						if (user.integrations.slack.enabled) {
							updateTrigger("SLACK_APP_MENTION_TRIGGER")
						} else {
							paragonConnect!.connect("slack", {})
						}
					}}>
					<CirclePlus size={15} />Trigger
				</Button>
			</div>
			<p className="mt-4 text-sm text-neutral-500 text-wrap text-center">
				We loaded just one of our triggers for demonstration purposes
				(more to come!).<br /><br />
				Visit&nbsp;
				<a href="https://docs.useparagon.com/actionkit/overview"
					target="_blank"
					className="text-indigo-700 hover:text-indigo-500 font-semibold">
					our webhook docs
				</a>
				&nbsp;to see how you can use custom webhooks along
				with our pre-built integration-specific webhooks like
				the <em>Slack App Mention</em> above.
			</p>

		</div >
	);
}

export const SLACK_APP_MENTION_TEST_PAYLOAD = JSON.stringify({
	"result": {
		"blocks": [
			{
				"block_id": "S4RPr",
				"elements": [
					{
						"elements": [
							{
								"type": "user",
								"user_id": "U04URSJ58"
							}
						],
						"type": "rich_text_section"
					}
				],
				"type": "rich_text"
			}
		],
		"channel": "C03NFFWH13M",
		"client_msg_id": "123123123",
		"event_ts": "1360782400.498405",
		"team": "TM7705V",
		"text": "Your app <@app_id> is mentioned.",
		"ts": "1360782400.498405",
		"type": "app_mention",
		"user": "U048S106P"
	}
}, null, 2);
