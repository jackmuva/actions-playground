"use client";
import { useWorkflowStore } from '@/store/workflowStore';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TriggerNode } from './trigger-node';
import { ActionNode } from './action-node';


const nodeTypes = {
	triggerNode: TriggerNode,
	actionNode: ActionNode,
}

export default function WorkflowArea() {
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore((state) => state);
	console.log("edges:", edges);
	return (
		<div className="w-full h-full">
			<ReactFlow nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
			/>
		</div>
	);
}
