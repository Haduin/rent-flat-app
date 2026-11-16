-- One payment per contract per month: generating payments twice at once must not create duplicates.
-- Rollback: ALTER TABLE flat.payment DROP CONSTRAINT payment_contract_scope_unique;
ALTER TABLE flat.payment
    ADD CONSTRAINT payment_contract_scope_unique UNIQUE (contract_id, scope_date);
