ALTER TABLE `products` ADD `apl_variant_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `products_apl_variant_id_unique` ON `products` (`apl_variant_id`);