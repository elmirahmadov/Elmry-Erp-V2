CREATE TABLE `Supplier` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `contactPerson` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `taxNumber` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'active',
  `companyId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `Supplier_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Supplier`
ADD CONSTRAINT `Supplier_companyId_fkey`
FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;