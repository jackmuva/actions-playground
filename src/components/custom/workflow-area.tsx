"use client";
import { useWorkflowStore } from '@/store/workflowStore';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function WorkflowArea() {
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore((state) => state);
	return (
		<div className="w-full h-full">
			<ReactFlow nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
			/>
		</div>
	);
}
