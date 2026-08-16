/*
  Backfill existing taxestimate records before making the
  newly introduced Milestone 3 fields required.

  Existing records:
  - annualIncome = 50000
  - estimatedTax = 2500
  - quarter = FY 2025-26
  - userId = 3

  Historical values are preserved.
*/

-- Add the new fields as nullable first so existing rows can be preserved.
ALTER TABLE `taxestimate`
    ADD COLUMN `businessExpenses` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `effectiveTaxRate` DOUBLE NULL,
    ADD COLUMN `filingStatus` VARCHAR(191) NULL,
    ADD COLUMN `grossIncome` DOUBLE NULL,
    ADD COLUMN `healthInsurance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `homeOffice` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `region` VARCHAR(191) NULL,
    ADD COLUMN `retirementContributions` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `taxRegime` VARCHAR(191) NULL,
    ADD COLUMN `taxYear` VARCHAR(191) NULL,
    ADD COLUMN `taxableIncome` DOUBLE NULL;

-- Backfill the existing historical records.
UPDATE `taxestimate`
SET
    `country` = 'India',
    `region` = 'India',
    `taxYear` = 'FY 2025-26',
    `taxRegime` = 'old',
    `filingStatus` = 'individual',
    `grossIncome` = `annualIncome`,
    `taxableIncome` = `annualIncome`,
    `effectiveTaxRate` = CASE
        WHEN `annualIncome` > 0
        THEN (`estimatedTax` / `annualIncome`) * 100
        ELSE 0
    END
WHERE `country` IS NULL;

-- Make the newly introduced fields required,
-- matching schema.prisma.
ALTER TABLE `taxestimate`
    MODIFY `country` VARCHAR(191) NOT NULL,
    MODIFY `effectiveTaxRate` DOUBLE NOT NULL,
    MODIFY `filingStatus` VARCHAR(191) NOT NULL,
    MODIFY `grossIncome` DOUBLE NOT NULL,
    MODIFY `region` VARCHAR(191) NOT NULL,
    MODIFY `taxRegime` VARCHAR(191) NOT NULL,
    MODIFY `taxYear` VARCHAR(191) NOT NULL,
    MODIFY `taxableIncome` DOUBLE NOT NULL;