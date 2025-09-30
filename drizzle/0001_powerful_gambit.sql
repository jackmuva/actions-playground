CREATE TABLE `Workflow` (
	`id` text PRIMARY KEY NOT NULL,
	`nodes` text,
	`edges` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
