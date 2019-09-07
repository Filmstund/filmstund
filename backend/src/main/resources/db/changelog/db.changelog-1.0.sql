--liquibase formatted sql

--changeset eda:createBioBudordTable
create table bio_budord
(
    number integer
        constraint bioBudord_pk primary key,
    phrase varchar(255) not null
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

--changeset eda:createLocationAliasTable
create table location_alias
(
    location           varchar(100)
        constraint location_alias_fk references location,
    alias              varchar(100)             not null,
    last_modified_date timestamp with time zone not null default current_timestamp
);
--rollback drop table if exists location_alias;