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
import { WorkflowRun } from '@/db/schema';

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
	testOutput: boolean;
	setTestOutput: (open: boolean) => void;
	paragonToken: string | null;
	setParagonToken: (token: string | null) => void;
	deployed: boolean;
	setDeployed: (deploy: boolean) => void;
	runSidebar: boolean;
	setRunSidebar: (open: boolean) => void;
	runHistory: {
		[id: string]: WorkflowRun,
	};
	setRunHistory: (runs: WorkflowRun[]) => void;
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
	testOutput: false,
	paragonToken: null,
	deployed: false,
	runSidebar: false,
	runHistory: {},

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

	setTestOutput: (isTest: boolean) => {
		set({ testOutput: isTest })
	},

	setParagonToken: (token: string | null) => set({ paragonToken: token }),

	setDeployed: (deploy: boolean) => set({ deployed: deploy }),

	setRunSidebar: (open: boolean) => {
		set({ runSidebar: open });
	},

	setRunHistory: (runs: WorkflowRun[]) => {
		const runMap: { [id: string]: WorkflowRun } = {};
		for (const run of runs) {
			runMap[run.id] = { ...run };
		}
		set({ runHistory: runMap });
	},
}));
