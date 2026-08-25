CREATE TABLE `checklistDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`payload` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklistDrafts_id` PRIMARY KEY(`id`),
	CONSTRAINT `checklistDrafts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `feedbackSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(32) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedbackSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `checklistDrafts` ADD CONSTRAINT `checklistDrafts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;