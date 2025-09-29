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
import { ParagonAction } from '@/components/feature/action-tester';

export type ParagonTrigger = {
	name: string;
	title: string;
	input?: Record<string, string>;
};

export type ActionNodeType = Node<{
	action: ParagonAction,
	icon: string,
	integration: string,
	output?: string;
	trigger?: ParagonTrigger;
}, 'actionNode'>

export type TriggerNodeType = Node<{
	trigger: ParagonTrigger | null,
	action?: ParagonAction,
	icon?: string,
	integration?: string,
	output?: string;
}, 'triggerNode'>

export type WorkflowNode = ActionNodeType | TriggerNodeType;

type WorkflowState = {
	nodes: WorkflowNode[];
	edges: Edge[];
	onNodesChange: OnNodesChange<Node>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	selectedNode: WorkflowNode | null;
	setNodes: (nodes: WorkflowNode[]) => void;
	setEdges: (edges: Edge[]) => void;
	setSelectedNode: (nodeId: string | null) => void;
	outputSidebar: boolean;
	setOutputSidebar: (open: boolean) => void;
	paragonToken: string | null;
	setParagonToken: (token: string | null) => void;
}



export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	nodes: [{
		id: "trigger",
		type: 'triggerNode',
		position: { x: 100, y: 100 },
		data: {
			trigger: null
		}
	}],
	edges: [],
	selectedNodeId: null,
	outputSidebar: false,
	paragonToken: null,

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

	setSelectedNode: (nodeId: string | null) => {
		const nodes = get().nodes;
		const node = nodes.filter((node) => node.id === nodeId)[0];
		set({ selectedNode: node });
	},

	setOutputSidebar: (isOpen: boolean) => set({ outputSidebar: isOpen }),

	setParagonToken: (token: string | null) => set({ paragonToken: token }),
}));
