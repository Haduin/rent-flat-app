-- SQL Insert Statements for Sample Data

-- Apartment table inserts
INSERT INTO flat.apartment (id, name) VALUES (1, 'Apartament Centrum');
INSERT INTO flat.apartment (id, name) VALUES (2, 'Apartament Mokotów');
INSERT INTO flat.apartment (id, name) VALUES (3, 'Apartament Wola');
INSERT INTO flat.apartment (id, name) VALUES (4, 'Apartament Ursynów');
INSERT INTO flat.apartment (id, name) VALUES (5, 'Apartament Praga');

-- Person table inserts
INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (1, 'Jan', 'Kowalski', 'ABC123456', 'Polska', 'jan.kowalski@example.com', 'RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (2, 'Anna', 'Nowak', 'DEF789012', 'Polska', 'anna.nowak@example.com', 'RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (3, 'Piotr', 'Wiśniewski', 'GHI345678', 'Polska', 'piotr.wisniewski@example.com', 'RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (4, 'Marta', 'Wójcik', 'JKL901234', 'Polska', 'marta.wojcik@example.com', 'RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (5, 'Tomasz', 'Kowalczyk', 'MNO567890', 'Polska', 'tomasz.kowalczyk@example.com', 'RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (6, 'Agnieszka', 'Kamińska', 'PQR123456', 'Polska', 'agnieszka.kaminska@example.com', 'NON_RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (7, 'Michał', 'Lewandowski', 'STU789012', 'Polska', 'michal.lewandowski@example.com', 'NON_RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (8, 'Karolina', 'Zielińska', 'VWX345678', 'Polska', 'karolina.zielinska@example.com', 'NON_RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (9, 'Paweł', 'Szymański', 'YZA901234', 'Polska', 'pawel.szymanski@example.com', 'NON_RESIDENT');

INSERT INTO flat.person (id, first_name, last_name, document_number, nationality, email, status) 
VALUES (10, 'Aleksandra', 'Dąbrowska', 'BCD567890', 'Polska', 'aleksandra.dabrowska@example.com', 'NON_RESIDENT');

-- Room table inserts
INSERT INTO flat.room (id, name, apartment_id) VALUES (1, '101', 1);
INSERT INTO flat.room (id, name, apartment_id) VALUES (2, '102', 1);
INSERT INTO flat.room (id, name, apartment_id) VALUES (3, '103', 1);
INSERT INTO flat.room (id, name, apartment_id) VALUES (4, '201', 2);
INSERT INTO flat.room (id, name, apartment_id) VALUES (5, '202', 2);
INSERT INTO flat.room (id, name, apartment_id) VALUES (6, '203', 2);
INSERT INTO flat.room (id, name, apartment_id) VALUES (7, '301', 3);
INSERT INTO flat.room (id, name, apartment_id) VALUES (8, '302', 3);
INSERT INTO flat.room (id, name, apartment_id) VALUES (9, '401', 4);
INSERT INTO flat.room (id, name, apartment_id) VALUES (10, '402', 4);
INSERT INTO flat.room (id, name, apartment_id) VALUES (11, '501', 5);
INSERT INTO flat.room (id, name, apartment_id) VALUES (12, '502', 5);
INSERT INTO flat.room (id, name, apartment_id) VALUES (13, 'Pokój niezależny', NULL);

-- Contract table inserts
INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (1, 1, 1, 1500.00, 1500.00, NULL, '2023-01-01', '2023-12-31', NULL, 'Umowa roczna', 'ACTIVE', '05');

INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (2, 2, 2, 1600.00, 1600.00, NULL, '2023-02-01', '2024-01-31', NULL, 'Umowa roczna', 'ACTIVE', '05');

INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (3, 3, 4, 1700.00, 1700.00, NULL, '2023-03-01', '2024-02-29', NULL, 'Umowa roczna', 'ACTIVE', '05');

INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (4, 4, 7, 1800.00, 1800.00, NULL, '2023-04-01', '2024-03-31', NULL, 'Umowa roczna', 'ACTIVE', '05');

INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (5, 5, 9, 1900.00, 1900.00, NULL, '2023-05-01', '2024-04-30', NULL, 'Umowa roczna', 'ACTIVE', '05');

INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (6, 6, 3, 1550.00, 1550.00, true, '2023-01-15', '2023-07-14', '2023-06-30', 'Umowa rozwiązana wcześniej', 'TERMINATED', '05');

INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (7, 7, 5, 1650.00, 1650.00, true, '2023-02-15', '2023-08-14', '2023-07-31', 'Umowa rozwiązana wcześniej', 'TERMINATED', '05');

INSERT INTO flat.contract (id, person_id, room_id, amount, deposit, deposit_returned, start_date, end_date, termination_date, description, status, payed_till_day_of_month) 
VALUES (8, 8, 8, 1750.00, 1750.00, false, '2023-03-15', '2023-09-14', '2023-08-31', 'Umowa rozwiązana wcześniej', 'TERMINATED', '05');

-- Payment table inserts
-- Active contracts - current month payments
INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (1, 1, '2023-10-05', '2023-10', 1500.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (2, 2, '2023-10-05', '2023-10', 1600.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (3, 3, '2023-10-05', '2023-10', 1700.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (4, 4, NULL, '2023-10', 1800.00, 'PENDING');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (5, 5, NULL, '2023-10', 1900.00, 'LATE');

-- Previous month payments
INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (6, 1, '2023-09-05', '2023-09', 1500.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (7, 2, '2023-09-05', '2023-09', 1600.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (8, 3, '2023-09-05', '2023-09', 1700.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (9, 4, '2023-09-07', '2023-09', 1800.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (10, 5, '2023-09-10', '2023-09', 1900.00, 'PAID');

-- Terminated contracts - last payments
INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (11, 6, '2023-06-05', '2023-06', 1550.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (12, 7, '2023-07-05', '2023-07', 1650.00, 'PAID');

INSERT INTO flat.payment (id, contract_id, payed_date, scope_date, amount, status) 
VALUES (13, 8, NULL, '2023-08', 1750.00, 'CANCELLED');
