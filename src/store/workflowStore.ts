import { create } from 'zustand';
import {
	type Edge,
	type Node,
	type OnNodesChange,
	type OnEdgesChange,
	type OnConnect,
	type NodeChange,
	addEdge,
	applyNodeChanges,
	applyEdgeChanges,
	type EdgeChange,
	type Connection,
	BuiltInNode,
} from '@xyflow/react';
import { ParagonAction } from '@/components/feature/action-tester';

export type ActionNodeType = Node<{
	action: ParagonAction,
	icon: string,
}, 'actionNode'>

export type TriggerNodeType = Node<{
	action?: ParagonAction,
	icon?: string,
}, 'triggerNode'>

export type WorkflowNode = BuiltInNode | ActionNodeType | TriggerNodeType;

type WorkflowState = {
	nodes: WorkflowNode[];
	edges: Edge[];
	onNodesChange: OnNodesChange<Node>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	selectedNodeId: string | null;
	setNodes: (nodes: WorkflowNode[]) => void;
	setEdges: (edges: Edge[]) => void;
	setSelectedNodeId: (id: string) => void;
}



export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	nodes: [{
		id: "trigger",
		type: 'triggerNode',
		position: { x: 100, y: 100 },
		data: {}
	}],
	edges: [],
	selectedNodeId: null,

	//@ts-expect-error not sure why yet
	onNodesChange: (changes: NodeChange<WorkflowNode>[]) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes)
		});
	},

	onEdgesChange: (changes: EdgeChange[]) => {
		set({
			edges: applyEdgeChanges(changes, get().edges)
		});
	},

	onConnect: (connection: Connection) => {
		set({
			edges: addEdge(connection, get().edges),
		});
	},

	setNodes: (nodes: WorkflowNode[]) => {
		set({ nodes: nodes });
	},

	setEdges: (edges: Edge[]) => {
		set({ edges: edges });
	},

	setSelectedNode: (nodeId: string) => {
		set({ selectedNodeId: nodeId });
	},
}));
