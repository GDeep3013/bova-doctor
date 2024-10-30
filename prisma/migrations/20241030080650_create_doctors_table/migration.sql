/*
  Warnings:

  - The primary key for the `doctors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `doctors` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - Made the column `specialty` on table `doctors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `doctors` DROP PRIMARY KEY,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `specialty` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
