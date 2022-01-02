create table gift_certificate
(
    user_id     uuid
        constraint giftcert_user_fk references users on delete cascade,
    number      varchar(25)
        constraint giftcert_number_unique unique,
    expire_time date                     not null default current_date + interval '1 year',
    create_time timestamp with time zone not null default current_timestamp,
    constraint giftcert_pk primary key (user_id, number)
);