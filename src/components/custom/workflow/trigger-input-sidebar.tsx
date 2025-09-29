import { Button } from "@/components/ui/button"
import { useWorkflowStore, WorkflowNode } from "@/store/workflowStore";
import { CircleChevronLeft, CirclePlus } from "lucide-react"

export const SLACK_ICON = "https://cdn.useparagon.com/latest/dashboard/public/integrations/slack.svg";

export default function TriggerInputSidebar() {
	const { nodes, setNodes, setSelectedNode } = useWorkflowStore((state) => state);

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
				}
			}
		};
		setNodes([...newNodes, newTriggerNode]);
	}

	return (
		<div className="w-full flex flex-col gap-4">
			<Button variant={"outline"} size={"sm"}
				className="w-fit"
				onClick={() => setSelectedNode(null)}>
				<CircleChevronLeft size={12} />
				Back
			</Button>

			<div className="border rounded-sm p-4 flex justify-between items-center">
				<div className="flex items-center overflow-hidden">
					<img alt="integration icon"
						src={SLACK_ICON}
						className="w-5 h-5 mr-1" />
					Slack App Mention
				</div>
				<Button variant={"outline"} size={"sm"}
					className="h-fit py-1"
					onClick={() => { updateTrigger("SLACK_APP_MENTION_TRIGGER") }}>
					<CirclePlus size={15} />Trigger
				</Button>
			</div>
		</div>
	);
}

export const APP_MENTION_TEST_PAYLOAD = {
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
}
