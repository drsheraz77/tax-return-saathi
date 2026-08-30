CREATE TABLE `aggregateVisitorDays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` varchar(10) NOT NULL,
	`pageViews` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aggregateVisitorDays_id` PRIMARY KEY(`id`),
	CONSTRAINT `aggregateVisitorDays_day_unique` UNIQUE(`day`)
);
