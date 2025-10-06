import { getRunsByUser, upsertWorkflow } from "@/db/queries";
import { WorkflowRun } from "@/db/schema";
import { userWithToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { user } = await userWithToken();
	if (!user) {
		return NextResponse.json({
			status: 401, data: "Unauthenticated user"
		});
	}

	const body = await req.json();
	try {
		const deployedWf = await upsertWorkflow(body.nodes, body.edges, user.id)
		return NextResponse.json({
			status: 200, data: deployedWf
		});
	} catch (err) {
		return NextResponse.json({
			status: 500, data: err
		});
	}
}

export async function GET() {
	const { user } = await userWithToken();
	if (!user) {
		return NextResponse.json({
			status: 401, data: "Unauthenticated user"
		});
	}

	try {
		const runs: WorkflowRun[] = await getRunsByUser(user.id);
		return NextResponse.json({
			status: 200, data: runs
		});
	} catch (err) {
		return NextResponse.json({
			status: 500, data: err
		});
	}
}
