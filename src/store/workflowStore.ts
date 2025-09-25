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
} from '@xyflow/react';

type WorkflowState = {
	nodes: Node[];
	edges: Edge[];
	onNodesChange: OnNodesChange<Node>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	setNodes: (nodes: Node[]) => void;
	setEdges: (edges: Edge[]) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	nodes: [],
	edges: [],

	onNodesChange: (changes: NodeChange<Node>[]) => {
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

	setNodes: (nodes: Node[]) => {
		set({ nodes: nodes });
	},

	setEdges: (edges: Edge[]) => {
		set({ edges: edges });
	}
}));
