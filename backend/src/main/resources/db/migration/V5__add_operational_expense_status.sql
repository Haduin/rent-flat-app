ALTER TABLE flat.operational_expense
    ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN paid_date DATE;
