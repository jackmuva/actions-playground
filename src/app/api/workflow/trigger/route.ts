import { NextResponse } from "next/server";
import { runWorkflow } from "./workflow-utils";
import { getWorkflowByUser, upsertWorkflow } from "@/db/queries";
import { WorkflowNode } from "@/store/workflowStore";
import { Workflow } from "@/db/schema";

export async function POST(req: Request) {
	const body: { data: any, userId: string } = await req.json();
	try {
		console.log(body);
		const curWorkflow: Workflow = (await getWorkflowByUser(body.userId))[0];
		const newNodes: WorkflowNode[] = await runWorkflow(
			curWorkflow.nodes,
			curWorkflow.edges,
			body.userId,
			JSON.stringify(body.data, null, 2));
		const updWf = await upsertWorkflow(newNodes, curWorkflow.edges, body.userId);
		return NextResponse.json({
			status: 200, data: updWf
		});
	} catch (err) {
		return NextResponse.json({
			status: 500, data: err
		});
	}
}
