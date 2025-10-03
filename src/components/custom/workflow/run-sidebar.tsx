import { WorkflowRun } from "@/db/schema";
import { useWorkflowStore } from "@/store/workflowStore";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { TestSidebar } from "./test-sidebar";
import { Button } from "@/components/ui/button";
import { CircleChevronLeft, RotateCw, TestTubeDiagonal } from "lucide-react";

export const RunSidebar = () => {
	const { runHistory, setRunHistory, nodes, setTestOutput, testOutput } = useWorkflowStore((state) => state);
	console.log("nodes: ", nodes);
	const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(testOutput ? {
		id: "test",
		nodes: nodes,
		userId: "test",
		datetime: new Date().toLocaleString()
	} as WorkflowRun : null);

	useEffect(() => {
		if (testOutput) {
			setSelectedRun({
				id: "test",
				nodes: nodes,
				userId: "test",
				datetime: new Date().toLocaleString()
			} as WorkflowRun)
		}
	}, [testOutput, nodes])

	const { mutate: update, isLoading: isLoading } = useSWR(`deployed/workflow`, async () => {
		console.log("refreshing data");
		const req = await fetch(
			`${window.document.location.origin}/api/workflow/deploy`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
		const res: { status: number, data: WorkflowRun[] } = await req.json();
		if (!req.ok) throw Error(res.data.toString());
		console.log("data: ", res);
		setRunHistory(res.data);
	},
		{
			revalidateOnFocus: false,
			revalidateOnMount: true,
			// refreshInterval: 10000,
		}
	);

	return (
		<div>
			<div className="w-96 max-h-full overflow-y-auto flex flex-col relative">
				{isLoading ? (
					<>
						<div className="w-full flex justify-between items-center">
							<h1 className="font-semibold ">
								Run History
							</h1>
							<Button variant={"outline"} size={"sm"}
								onClick={() => update()}>
								<RotateCw size={12} />
							</Button>
						</div>

						<div className="flex items-center justify-center w-full 
							italic mt-4 animate-pulse">
							Loading...
						</div>
					</>
				) : (!selectedRun && !testOutput ? (
					<>
						<div className="w-full flex justify-between items-center">
							<h1 className="font-semibold ">
								Deployed Runs
							</h1>
							<Button variant={"outline"} size={"sm"}
								onClick={() => update()}>
								<RotateCw size={12} />
							</Button>
						</div>
						{Object.keys(runHistory).length > 0 ?
							(Object.keys(runHistory).map((runKey) => {
								return (
									<div key={runKey}
										className="flex items-center justify-between border-b 
								py-2 cursor-pointer hover:bg-input/50 rounded-sm px-2
								text-sm"
										onClick={() => {
											setTestOutput(false);
											setSelectedRun(runHistory[runKey])
										}}>
										<div className="flex items-center gap-1">
											{runHistory[runKey].nodes.map((node) => {
												return <img src={node.data.icon}
													className="w-3 h-3"
													key={node.id} />
											})}
										</div>
										<div>
											{new Date(runHistory[runKey].datetime).toLocaleString()}
										</div>
									</div>
								);
							})) : (
								<div className="flex items-center justify-center w-full 
							italic mt-4">
									No runs yet...
								</div>

							)}

						<h1 className="font-semibold mt-4">
							Test Run
						</h1>
						{nodes && <div className="flex items-center justify-between border-b 
								py-2 cursor-pointer hover:bg-input/50 rounded-sm px-2
								text-sm"
							onClick={() => {
								setSelectedRun({
									id: "test",
									nodes: nodes,
									userId: "test",
									datetime: new Date().toLocaleString()
								} as WorkflowRun);
							}}>
							<div className="flex items-center gap-1">
								{nodes.map((node) => {
									if (node.data.icon) {
										return <img src={node.data.icon}
											className="w-3 h-3"
											key={node.id} />
									}
								})}
							</div>
							<div>
								test outputs
							</div>
						</div>}
					</>
				) : (
					<TestSidebar title={new Date(selectedRun?.datetime ?? new Date()).toLocaleString()}
						nodes={selectedRun?.nodes ?? []}
						back={() => {
							setTestOutput(false);
							setSelectedRun(null);
						}} />
				))
				}
			</div>
		</div>

	);
}
