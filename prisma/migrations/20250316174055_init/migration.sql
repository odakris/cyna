/*
  Warnings:

  - Added the required column `stock` to the `Produit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `produit` ADD COLUMN `stock` INTEGER NOT NULL;
