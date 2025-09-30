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
import { ConnectInputValue, SerializedConnectInput } from '@useparagon/connect';

export type ParagonTrigger = {
	name: string;
	title: string;
	description?: string;
	inputs?: SerializedConnectInput[];
};

export type ActionNodeType = Node<{
	action: ParagonAction,
	icon: string,
	integration: string,
	inputValues: Record<string, ConnectInputValue>;
	output?: string;
	trigger?: ParagonTrigger;
}, 'actionNode'>

//TODO:Make Trigger Node type an Action Node type
export type TriggerNodeType = Node<{
	trigger: ParagonTrigger | null,
	inputValues: Record<string, ConnectInputValue>;
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
	deployed: boolean;
	setDeployed: (deploy: boolean) => void;
}



export const useWorkflowStore = create<WorkflowState>((set, get) => ({
	nodes: [{
		id: "trigger",
		type: 'triggerNode',
		position: { x: 100, y: 100 },
		data: {
			trigger: null,
			inputValues: {},
		}
	}],
	edges: [],
	selectedNodeId: null,
	outputSidebar: false,
	paragonToken: null,
	deployed: false,

	//TODO:fix typing on this
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

	setDeployed: (deploy: boolean) => set({ deployed: deploy }),
}));
