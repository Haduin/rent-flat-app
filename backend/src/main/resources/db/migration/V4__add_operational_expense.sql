CREATE TABLE flat.operational_expense_template (
    id SERIAL PRIMARY KEY,
    apartment_id INT REFERENCES flat.apartment (id),
    room_id INT REFERENCES flat.room (id),
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    day_of_month INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE flat.operational_expense (
    id SERIAL PRIMARY KEY,
    apartment_id INT REFERENCES flat.apartment (id),
    room_id INT REFERENCES flat.room (id),
    insert_date DATE NOT NULL,
    cost_date DATE,
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    invoice_number VARCHAR(100),
    template_id INT REFERENCES flat.operational_expense_template (id)
);
