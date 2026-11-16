-- One generated expense per template per month: concurrent generation must not create duplicates.
-- No cleanup on purpose: duplicates never occurred; if one exists this migration must fail loudly.
-- Rollback: DROP INDEX flat.operational_expense_template_month_unique;
CREATE UNIQUE INDEX operational_expense_template_month_unique
    ON flat.operational_expense (template_id, date_trunc('month', insert_date::timestamp));
