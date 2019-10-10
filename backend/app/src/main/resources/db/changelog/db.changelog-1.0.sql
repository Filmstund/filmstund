--liquibase formatted sql

--changeset eda:createBioBudordTable
create table bio_budord
(
    number integer
        constraint bioBudord_pk primary key,
    phrase varchar(255)
        constraint phrase_uniq unique not null
);
-- rollback DROP table if exists bio_budord;

--changeset eda:seedBioBudordTable
insert into bio_budord (number, phrase)
values (1, 'Du skall icke spoila'),
       (2, 'Låt din nästa se på bio såsom du själv skulle vilja se på bio'),
       (3, 'Du skall icke späda din cola'),
       (4, 'Det skall alltid finnas något att nomma på'),
       (5, 'Du skola icke låta teoretiska biopoäng gå till spillo'),
       (6, 'Du skall inga andra biogudar hava vid sidan av mig'),
       (7, 'Du skall offra vart hundrade popcorn till din nästa'),
       (8, 'Tänk på biodagen så att du helgar den'),
       (9, 'Du skall icke stjäla din grannes popcorn utan vänta tryggt på ditt hundrade'),
       (10, 'Du skall icke frestas av 3D, ty det är djävulens påfund'),
       (37, 'Tag icke med en bebis');
--rollback delete from bio_budord where number in (1,2,3,4,5,6,7,8,9,10,37);

--changeset eda:createLocationTable
create table location
(
    name               varchar(100)             not null
        constraint location_pk primary key,
    city_alias         varchar(2)               null,
    city               varchar(100)             null,
    street_address     varchar(100)             null,
    postal_code        varchar(10)              null,
    postal_address     varchar(100)             null,
    latitude           float                    null,
    longitude          float                    null,
    filmstaden_id      varchar(10)              null
        constraint location_fsId_unique unique,
    last_modified_date timestamp with time zone not null default current_timestamp
);
--rollback DROP table if exists location;

-- FIXME: remove when JPA is removed
--changeset eda:createLocationAliasTable
create table location_alias
(
    location           varchar(100)
        constraint location_alias_fk references location on delete cascade,
    alias              varchar(100)
        constraint alias_uniq unique            not null,
    last_modified_date timestamp with time zone not null default current_timestamp
);
--rollback drop table if exists location_alias;

--changeset eda:createTableUsers
create table users
(
    id                 uuid
        constraint user_pk primary key,
    google_id          varchar(25)
        constraint user_ids_google_uniq unique,
    filmstaden_id      varchar(7)   null
        constraint user_ids_fsid_uniq unique,
    first_name         varchar(100) not null,
    last_name          varchar(100) not null,
    nick               varchar(50)  not null,
    email              varchar(100) not null,
    phone              varchar(13)  null,
    avatar             varchar(255) null,
    calendar_feed_id   uuid
        constraint user_calendarfeedid_unique unique,
    last_login         timestamp    not null default current_timestamp,
    signup_date        timestamp    not null default current_timestamp,
    last_modified_date timestamp    not null default current_timestamp
);
--rollback drop table if exists "user";

--changeset eda:createTableGiftCert
create table gift_certificate
(
    user_id    uuid
        constraint giftcert_user_fk references users on delete cascade,
    number     varchar(15)
        constraint giftcert_number_unique unique,
    expires_at date    not null default current_date + interval '1 year',
    constraint giftcert_pk primary key (user_id, number)
);
--rollback drop table if exists gift_certificate;

--changeset eda:createTableMovie
create table movie
(
    id                      uuid
        constraint movie_pk primary key,
    filmstaden_id           varchar(20)              null
        constraint fsId_uniq unique,
    imdb_id                 varchar(20)              null,
    tmdb_id                 bigint                   null,
    slug                    varchar(100)             null,
    title                   varchar(100)             not null,
    synopsis                text                     null,
    original_title          varchar(100)             null,
    release_date            date                     null,
    production_year         integer                  null     default 1900
        constraint productionyear_nonneg check (production_year >= 1900),
    runtime                 interval                          default '0h',
    poster                  varchar(255)             null,
    genres                  varchar(100)[]           not null default '{}',
    popularity              float                    not null default 0.0,
    popularity_last_updated timestamp                         default timestamp '1970-01-01 00:00:00',
    archived                boolean                  not null default false,
    last_modified_date      timestamp with time zone not null default current_timestamp,
    created_date            timestamp with time zone not null default current_timestamp
);
--rollback drop table if exists movie;

-- FIXME remove when jpa is removed
--changeset eda:createTableMovieGenres
create table movie_genres
(
    genre    varchar(100) not null,
    movie_id uuid
        constraint movie_movie_fk references movie on delete cascade
);
--rollback drop table if exists movie_genres;

--changeset eda:createTableCinemaScreen
create table cinema_screen
(
    id   varchar(50)
        constraint cinema_screen_pk primary key,
    name varchar(255) null default null
);

--rollback drop table if exists cinema_screen;

--changeset eda:createTableShowing
create table showing
(
    id                    uuid
        constraint showing_pk primary key,
    web_id                varchar(10)            not null,
    slug                  varchar(100)           not null,
    date                  date                   not null,
    time                  time without time zone not null,
    movie_id              uuid                   not null
        constraint showing_movie_fk references movie on delete no action,
    location_id           varchar(100)           null
        constraint showing_location_fk references location on delete set null,
    cinema_screen_id      varchar(50)            null
        constraint showing_cs_fk references cinema_screen on delete set null,
    filmstaden_showing_id varchar(50)            null,
    price                 integer                not null default 0
        constraint showing_price_positive check (price >= 0),
    tickets_bought        boolean                not null default false,
    admin                 uuid                   not null
        constraint showing_admin_fk references users,
    pay_to_user           uuid                   not null
        constraint showing_paytouser_fk references users,
    last_modified_date    timestamp              not null default current_timestamp,
    created_date          timestamp              not null default current_timestamp
);

--changeset eda:createTableParticipant
create table participant
(
    user_id               uuid        not null
        constraint participant_user_fk references users on delete cascade,
    showing_id            uuid        not null
        constraint participant_showing_fk references showing on delete cascade,

    participant_type      varchar(50) not null default 'SWISH',

    has_paid              boolean     not null default false,
    amount_owed           integer     not null default 0,
    gift_certificate_used varchar(15) null
        constraint participant_giftcert_unique unique,

    constraint participant_giftcert_fk foreign key (user_id, gift_certificate_used) references gift_certificate on delete set null,
    constraint participant_pk primary key (showing_id, user_id)
);
--rollback drop table if exists participant;

--changeset eda:createTableTicket
create table ticket
(
    id                       varchar(15)
        constraint ticket_pk primary key,
    showing_id               uuid
        constraint ticket_showing_fk references showing on delete cascade,
    assigned_to_user         uuid
        constraint ticket_user_fk references users on delete cascade,
    profile_id               varchar(10)            null,
    barcode                  text                   not null,
    customer_type            varchar(50)            not null,
    customer_type_definition varchar(50)            not null,
    cinema                   varchar(100)           not null,
    cinema_city              varchar(50)            null,
    screen                   varchar(50)            not null,
    seat_row                 integer                not null default 0
        constraint ticket_seat_row_positive check (seat_row >= 0),
    seat_number              integer                not null default 0
        constraint ticket_seat_number_positive check (seat_number >= 0),
    date                     date                   not null,
    time                     time without time zone not null,
    movie_name               varchar(100)           not null,
    movie_rating             varchar(30)            not null,
    attributes               varchar(50)[]          not null default '{}'
);
--rollback drop table if exists ticket;

-- FIXME: remove when migrated to TicketDao
--changeset eda:createTableTicketAttribute
create table ticket_attribute
(
    ticket_id varchar(15)
        constraint ticket_attributes_ticket_fk references ticket on delete cascade,
    attribute varchar(50) not null,
    constraint ticket_attributes_pk primary key (ticket_id, attribute)
);
--rollback drop table if exists ticket_attribute;