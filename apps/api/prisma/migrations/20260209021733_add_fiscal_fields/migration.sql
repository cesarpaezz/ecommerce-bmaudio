-- AlterTable
ALTER TABLE "products" ADD COLUMN     "cest" TEXT,
ADD COLUMN     "gtin" TEXT,
ADD COLUMN     "ncm" TEXT,
ADD COLUMN     "origem" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unidadeMedida" TEXT NOT NULL DEFAULT 'UN',
ADD COLUMN     "warrantyMonths" INTEGER,
ADD COLUMN     "warrantyTerms" TEXT;
