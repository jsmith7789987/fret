-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'DEALER', 'ADMIN');

-- CreateEnum
CREATE TYPE "GuitarSlot" AS ENUM ('OWNED', 'CHASING');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('MINT', 'EXCELLENT', 'VERY_GOOD_PLUS', 'VERY_GOOD', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ListingTier" AS ENUM ('STANDARD', 'PREMIUM', 'DEALER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "firstName" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "onboardingText" TEXT,
    "genres" TEXT[],
    "brands" TEXT[],
    "currentGuitars" TEXT,
    "dreamGuitar" TEXT,
    "maxSpend" INTEGER,
    "models" TEXT[],
    "bodyShapes" TEXT[],
    "topWoods" TEXT[],
    "backSidesWoods" TEXT[],
    "sophistication" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileGuitar" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "slot" "GuitarSlot" NOT NULL DEFAULT 'OWNED',
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "bodyShape" TEXT,
    "topWood" TEXT,
    "backSidesWood" TEXT,
    "yearBuilt" INTEGER,
    "serialNumber" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileGuitar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandSuggestion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "promoted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "finish" TEXT,
    "condition" "Condition" NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "serialNumber" TEXT NOT NULL,
    "bodyShape" TEXT,
    "topWood" TEXT,
    "backSidesWood" TEXT,
    "neckWood" TEXT,
    "fretboardWood" TEXT,
    "bracing" TEXT,
    "nutWidth" TEXT,
    "scaleLength" TEXT,
    "finishType" TEXT,
    "electronics" TEXT,
    "caseType" TEXT,
    "countryOfOrigin" TEXT,
    "modifications" TEXT,
    "wearAndTear" TEXT,
    "wearSummary" TEXT,
    "videoId" TEXT,
    "videoThumb" TEXT,
    "photos" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "tier" "ListingTier" NOT NULL DEFAULT 'STANDARD',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");

-- CreateIndex
CREATE INDEX "ProfileGuitar_profileId_idx" ON "ProfileGuitar"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandSuggestion_slug_key" ON "BrandSuggestion"("slug");

-- CreateIndex
CREATE INDEX "BrandSuggestion_promoted_idx" ON "BrandSuggestion"("promoted");

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_listingId_buyerId_key" ON "MatchScore"("listingId", "buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedListing_userId_listingId_key" ON "SavedListing"("userId", "listingId");

-- AddForeignKey
ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGuitar" ADD CONSTRAINT "ProfileGuitar_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

