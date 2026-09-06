CREATE TABLE flat.apartment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE flat.room (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    apartment_id INT REFERENCES flat.apartment (id)
);

CREATE TABLE flat.person (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(255) NOT NULL,
    nationality VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status VARCHAR(255) NOT NULL
);

CREATE TABLE flat.contract (
    id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES flat.person (id),
    room_id INT NOT NULL REFERENCES flat.room (id),
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

CREATE TABLE flat.payment (
    id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES flat.contract (id),
    payed_date DATE,
    scope_date VARCHAR(7) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(255) NOT NULL
);

CREATE TABLE flat.payment_split (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES flat.payment (id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL
);

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
