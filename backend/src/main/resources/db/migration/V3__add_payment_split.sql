CREATE TABLE flat.payment_split (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES flat.payment (id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL
);
