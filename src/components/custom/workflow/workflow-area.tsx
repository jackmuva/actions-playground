"use client";
import { useWorkflowStore } from '@/store/workflowStore';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TriggerNode } from './trigger-node';
import { ActionNode } from './action-node';
import { useEffect } from 'react';


const nodeTypes = {
	triggerNode: TriggerNode,
	actionNode: ActionNode,
}

export default function WorkflowArea({ session }: { session: { paragonUserToken?: string } }) {
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setParagonToken } = useWorkflowStore((state) => state);

	useEffect(() => {
		//NOTE:Consider deleting deployed workflow when user leaves
		// if (typeof window !== 'undefined') {
		// 	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		// 		event.preventDefault();
		// 		event.returnValue = "hi";
		// 		return "hi";
		// 	};
		//
		// 	window.addEventListener("beforeunload", handleBeforeUnload);
		//
		// 	return () => {
		// 		window.removeEventListener("beforeunload", handleBeforeUnload);
		// 	};
		// }
		setParagonToken(session.paragonUserToken ?? null);
	}, [session.paragonUserToken, setParagonToken]);

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
