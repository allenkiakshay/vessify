/*
  Warnings:

  - You are about to drop the column `accessToken` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `accessTokenExpiresAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `idToken` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "accessToken",
DROP COLUMN "accessTokenExpiresAt",
DROP COLUMN "idToken",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpiresAt",
DROP COLUMN "scope";
