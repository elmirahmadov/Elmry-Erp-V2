-- AlterTable: migrate Warehouse off direct branchId onto BranchWarehouse
CREATE TABLE IF NOT EXISTS `BranchWarehouse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `warehouseId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Copy existing warehouse→branch links before dropping FK
INSERT INTO `BranchWarehouse` (`branchId`, `warehouseId`, `createdAt`)
SELECT `branchId`, `id`, NOW(3) FROM `Warehouse`
WHERE `branchId` IS NOT NULL;

-- Drop old Warehouse unique/index/FK on branchId
ALTER TABLE `Warehouse` DROP INDEX `Warehouse_branchId_name_key`;
ALTER TABLE `Warehouse` DROP FOREIGN KEY `Warehouse_branchId_fkey`;
ALTER TABLE `Warehouse` DROP COLUMN `branchId`;
ALTER TABLE `Warehouse` ADD UNIQUE INDEX `Warehouse_companyId_name_key`(`companyId`, `name`);

ALTER TABLE `BranchWarehouse` ADD UNIQUE INDEX `BranchWarehouse_branchId_warehouseId_key`(`branchId`, `warehouseId`);
ALTER TABLE `BranchWarehouse` ADD INDEX `BranchWarehouse_warehouseId_idx`(`warehouseId`);
ALTER TABLE `BranchWarehouse` ADD CONSTRAINT `BranchWarehouse_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BranchWarehouse` ADD CONSTRAINT `BranchWarehouse_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: migrate Till off direct branchId onto BranchTill + companyId
CREATE TABLE IF NOT EXISTS `BranchTill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `tillId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add companyId to Till (from branch.companyId)
ALTER TABLE `Till` ADD COLUMN `companyId` INTEGER NULL;

UPDATE `Till` t
INNER JOIN `Branch` b ON b.`id` = t.`branchId`
SET t.`companyId` = b.`companyId`;

INSERT INTO `BranchTill` (`branchId`, `tillId`, `createdAt`)
SELECT `branchId`, `id`, NOW(3) FROM `Till`
WHERE `branchId` IS NOT NULL;

ALTER TABLE `Till` DROP INDEX `Till_branchId_name_key`;
ALTER TABLE `Till` DROP INDEX `Till_branchId_idx`;
ALTER TABLE `Till` DROP FOREIGN KEY `Till_branchId_fkey`;
ALTER TABLE `Till` DROP COLUMN `branchId`;
ALTER TABLE `Till` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Till` ADD UNIQUE INDEX `Till_companyId_name_key`(`companyId`, `name`);
ALTER TABLE `Till` ADD INDEX `Till_companyId_idx`(`companyId`);
ALTER TABLE `Till` ADD CONSTRAINT `Till_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BranchTill` ADD UNIQUE INDEX `BranchTill_branchId_tillId_key`(`branchId`, `tillId`);
ALTER TABLE `BranchTill` ADD INDEX `BranchTill_tillId_idx`(`tillId`);
ALTER TABLE `BranchTill` ADD CONSTRAINT `BranchTill_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BranchTill` ADD CONSTRAINT `BranchTill_tillId_fkey` FOREIGN KEY (`tillId`) REFERENCES `Till`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: migrate User.branchId onto BranchUser
CREATE TABLE IF NOT EXISTS `BranchUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `BranchUser` (`branchId`, `userId`, `createdAt`)
SELECT `branchId`, `id`, NOW(3) FROM `User`
WHERE `branchId` IS NOT NULL;

ALTER TABLE `User` DROP FOREIGN KEY `User_branchId_fkey`;
ALTER TABLE `User` DROP COLUMN `branchId`;

ALTER TABLE `BranchUser` ADD UNIQUE INDEX `BranchUser_branchId_userId_key`(`branchId`, `userId`);
ALTER TABLE `BranchUser` ADD INDEX `BranchUser_userId_idx`(`userId`);
ALTER TABLE `BranchUser` ADD CONSTRAINT `BranchUser_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BranchUser` ADD CONSTRAINT `BranchUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
