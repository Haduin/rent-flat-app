CREATE TABLE flat.contract_history (
    id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES flat.contract (id),
    change_type VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    room_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    deposit NUMERIC(10, 2) NOT NULL,
    deposit_returned BOOLEAN,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    termination_date DATE,
    description VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    payed_till_day_of_month VARCHAR(2) NOT NULL
);
