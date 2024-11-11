/*
  Warnings:

  - Added the required column `email` to the `OTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exprire` to the `OTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OTP` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `exprire` DATETIME(3) NOT NULL;
