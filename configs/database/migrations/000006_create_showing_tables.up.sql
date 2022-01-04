BEGIN TRANSACTION;

create table cinema_screens
(
    id          varchar(50)
        constraint cinema_screen_pk primary key,
    name        varchar(255)             null     default null,
    create_time timestamp with time zone not null default current_timestamp
);


create table showings
(
    id                    uuid
        constraint showing_pk primary key,
    web_id                varchar(10)            not null,
    slug                  varchar(100)           not null,
    date                  date                   not null,
    time                  time without time zone not null,
    movie_id              uuid                   not null
        constraint showing_movie_fk references movies on delete no action,
    location              varchar(256)           not null,
    cinema_screen_id      varchar(50)            null
        constraint showing_cs_fk references cinema_screens on delete set null,
    filmstaden_showing_id varchar(50)            null,
    price                 integer                not null default 0
        constraint showing_price_positive check (price >= 0),
    tickets_bought        boolean                not null default false,
    admin                 uuid                   not null
        constraint showing_admin_fk references users,
    pay_to_user           uuid                   not null
        constraint showing_paytouser_fk references users,
    private               boolean                not null default false,
    update_time           timestamp              not null default current_timestamp,
    create_time           timestamp              not null default current_timestamp
);

create table attendees
(
    user_id               uuid                     not null
        constraint attendee_user_fk references users on delete cascade,
    showing_id            uuid                     not null
        constraint attendee_showing_fk references showings on delete cascade,

    attendee_type         varchar(50)              not null default 'SWISH',

    has_paid              boolean                  not null default false,
    amount_owed           integer                  not null default 0,
    gift_certificate_used varchar(25)              null
        constraint attendee_giftcert_unique unique,
    update_time           timestamp with time zone not null default current_timestamp,
    create_time           timestamp with time zone not null default current_timestamp,

    constraint attendee_giftcert_fk foreign key (user_id, gift_certificate_used) references gift_certificate on delete set null,
    constraint attendee_pk primary key (showing_id, user_id)
);

create table tickets
(
    id                       varchar(15)
        constraint ticket_pk primary key,
    showing_id               uuid
        constraint ticket_showing_fk references showings on delete cascade,
    assigned_to_user         uuid
        constraint ticket_user_fk references users on delete cascade,
    profile_id               varchar(15)              null,
    barcode                  text                     not null,
    customer_type            varchar(50)              not null,
    customer_type_definition varchar(50)              not null,
    cinema                   varchar(100)             not null,
    cinema_city              varchar(50)              null,
    screen                   varchar(50)              not null,
    seat_row                 integer                  not null default 0
        constraint ticket_seat_row_positive check (seat_row >= 0),
    seat_number              integer                  not null default 0
        constraint ticket_seat_number_positive check (seat_number >= 0),
    date                     date                     not null,
    time                     time without time zone   not null,
    movie_name               varchar(100)             not null,
    movie_rating             varchar(30)              not null,
    attributes               varchar(50)[]            not null default '{}',
    update_time              timestamp with time zone not null default current_timestamp,
    create_time              timestamp with time zone not null default current_timestamp
);
COMMIT TRANSACTION;
