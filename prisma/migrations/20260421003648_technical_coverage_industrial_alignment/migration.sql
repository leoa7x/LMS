-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "technologyCoverageTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "vendorCoverageTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Simulator" ADD COLUMN     "technologyCoverageTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "vendorCoverageTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
