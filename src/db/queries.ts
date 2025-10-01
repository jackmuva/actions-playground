import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient, ResultSet } from '@libsql/client';
import { User, user, Workflow, workflow, WorkflowRun, workflowRun } from './schema';
import { desc, eq } from 'drizzle-orm';
import { Edge } from '@xyflow/react';
import { WorkflowNode } from '@/store/workflowStore';

const db = drizzle(
	createClient({
		url: process.env.TURSO_DATABASE_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN ?? "",
	})
)

export async function getUser(email: string): Promise<Array<User>> {
	try {
		return await db.select().from(user).where(eq(user.email, email));
	} catch (error) {
		console.error("Failed to get user from database", error);
		throw error;
	}
}

export async function createUser(
	id: string,
	email: string,
): Promise<ResultSet> {
	try {
		return await db.insert(user).values({ id, email });
	} catch (error) {
		console.error("Failed to create user in database");
		throw error;
	}
}

export async function getWorkflowByUser(userId: string): Promise<Array<Workflow>> {
	try {
		return await db.select().from(workflow).where(eq(workflow.userId, userId));
	} catch (error) {
		console.error("Failed to get workflow from database", error);
		throw error;
	}
}

export async function upsertWorkflow(
	nodes: WorkflowNode[],
	edges: Edge[],
	userId: string,
): Promise<Workflow[]> {
	try {
		const workflows: Workflow[] = await getWorkflowByUser(userId);
		if (workflows.length > 0) {
			return await db.update(workflow)
				.set({ nodes, edges, userId })
				.where(eq(workflow.userId, userId))
				.returning();
		} else {
			return await db.insert(workflow)
				.values({ nodes, edges, userId })
				.returning();
		}
	} catch (error) {
		console.error("Failed to create workflow in database");
		throw error;
	}
}

export async function getRunsByUser(userId: string): Promise<Array<WorkflowRun>> {
	try {
		return await db.select().from(workflowRun).where(eq(workflowRun.userId, userId))
			.orderBy(desc(workflowRun.datetime));
	} catch (error) {
		console.error("Failed to get run from database", error);
		throw error;
	}
}

export async function createRun(
	nodes: WorkflowNode[],
	userId: string,
): Promise<WorkflowRun[]> {
	try {
		return await db.insert(workflowRun)
			.values({
				nodes: nodes,
				userId: userId,
				datetime: new Date().toUTCString(),
			})
			.returning();
	} catch (error) {
		console.error("Failed to create workflow in database");
		throw error;
	}
}

