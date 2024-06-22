-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `criminalEvidence` (
	`id` int(10) unsigned AUTO_INCREMENT NOT NULL,
	`indictment_id` int(10) unsigned NOT NULL,
	`attachment` mediumblob NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `criminalIndictments` (
	`id` int(10) unsigned AUTO_INCREMENT NOT NULL,
	`criminal_id` smallint(5) unsigned NOT NULL,
	`officer_discord_id` varchar(24) NOT NULL,
	`charges` varchar(256) NOT NULL,
	`jailTime` int(10) unsigned NOT NULL,
	`fine` decimal(64,2) NOT NULL,
	`message_id` varchar(24) DEFAULT 'NULL',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `criminals` (
	`id` smallint(5) unsigned AUTO_INCREMENT NOT NULL,
	`username` varchar(16) NOT NULL,
	`thread_id` varchar(24) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
ALTER TABLE `criminalEvidence` ADD CONSTRAINT `FK_criminalEvidence_criminalIndictments` FOREIGN KEY (`indictment_id`) REFERENCES `criminalIndictments`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `criminalIndictments` ADD CONSTRAINT `FK_criminalIndictments_criminal` FOREIGN KEY (`criminal_id`) REFERENCES `criminals`(`id`) ON DELETE restrict ON UPDATE cascade;
*/