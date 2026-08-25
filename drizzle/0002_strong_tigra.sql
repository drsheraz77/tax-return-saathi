CREATE TABLE `feedbackRetentionSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleCronTaskUid` varchar(65) NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbackRetentionSchedules_id` PRIMARY KEY(`id`),
	CONSTRAINT `feedbackRetentionSchedules_taskUid_unique` UNIQUE(`scheduleCronTaskUid`)
);
