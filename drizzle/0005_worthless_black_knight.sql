CREATE TABLE `WorkflowRun` (
	`id` text PRIMARY KEY NOT NULL,
	`nodes` text NOT NULL,
	`userId` text NOT NULL,
	`datetime` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
