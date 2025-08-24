CREATE TABLE `todos` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`completed` integer DEFAULT 0
);

CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`original_prompt` text NOT NULL,
	`expanded_data` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE `evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`criteria` text NOT NULL,
	`overall_score` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`)
);

CREATE TABLE `exports` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`format` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`)
);
