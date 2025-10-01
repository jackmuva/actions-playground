import { WorkflowRun } from "@/db/schema";
import { useWorkflowStore } from "@/store/workflowStore";
import { useState } from "react";
import useSWR from "swr";
import { TestSidebar } from "./test-sidebar";
import { Button } from "@/components/ui/button";
import { CircleChevronLeft, RotateCw } from "lucide-react";

export const RunSidebar = () => {
	const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
	const { deployed, runHistory, setRunHistory } = useWorkflowStore((state) => state);

	const { mutate: update, isLoading: isLoading } = useSWR(deployed ? `deployed/workflow` : null, async () => {
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
				) : (!selectedRun ? (
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
						{Object.keys(runHistory).length > 0 ?
							(Object.keys(runHistory).map((runKey) => {
								return (
									<div key={runKey}
										className="flex items-center justify-between border-b 
								py-2 cursor-pointer hover:bg-input/50 rounded-sm px-2
								text-sm"
										onClick={() => {
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
					</>
				) : (
					<>
						<div className="flex justify-between items-center">
							<Button variant={"outline"} size={"sm"}
								className="w-fit"
								onClick={() => setSelectedRun(null)}>
								<CircleChevronLeft size={12} />
								Back
							</Button>
							<h1 className="font-semibold">
								{new Date(selectedRun.datetime).toLocaleString()}
							</h1>
						</div>
						<TestSidebar title=""
							nodes={selectedRun.nodes} />
					</>
				))
				}
			</div>
		</div>

	);
}
