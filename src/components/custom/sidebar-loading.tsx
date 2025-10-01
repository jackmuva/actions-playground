export const SidebarLoading = () => {
	return Array(5)
		.fill(null)
		.map((_, i) => (
			<div
				className={`w-full mb-2 mr-2 rounded-lg cursor-pointer animate-pulse`}
				key={i}
			>
				<div className="border border-slate-300 dark:border-slate-700 rounded p-4">
					<div className="flex items-center mb-1">
						<div className="inline w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-500 mr-2" />
						<div className="inline rounded-full w-48 h-2 bg-slate-200 dark:bg-slate-500" />
					</div>
				</div>
			</div>
		));
};
