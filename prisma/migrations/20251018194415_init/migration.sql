-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "rxCui" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "forms" TEXT[],
    "strengths" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zip" (
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Zip_pkey" PRIMARY KEY ("zip")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "rxCui" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "zip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "drugRxCui" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceSubtotal" DOUBLE PRECISION NOT NULL,
    "priceFees" DOUBLE PRECISION NOT NULL,
    "shipping" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "pickupOrMail" TEXT NOT NULL,
    "pharmacyName" TEXT,
    "pharmacyAddr" TEXT,
    "pharmacyLat" DOUBLE PRECISION,
    "pharmacyLng" DOUBLE PRECISION,
    "terms" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drug_rxCui_key" ON "Drug"("rxCui");
