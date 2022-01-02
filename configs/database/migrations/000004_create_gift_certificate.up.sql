create table gift_certificate
(
    user_id      uuid
        constraint giftcert_user_fk references users on delete cascade,
    number       varchar(25)
        constraint giftcert_number_unique unique,
    expires_at   date                     not null default current_date + interval '1 year',
    created_date timestamp with time zone not null default current_timestamp,
    constraint giftcert_pk primary key (user_id, number)
);