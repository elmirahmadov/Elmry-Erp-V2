/*
  Warnings:

  - A unique constraint covering the columns `[barcode,companyId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Product_barcode_key` ON `Product`;

-- CreateIndex
CREATE UNIQUE INDEX `Product_barcode_companyId_key` ON `Product`(`barcode`, `companyId`);
