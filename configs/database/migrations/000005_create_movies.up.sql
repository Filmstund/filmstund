create table movies
(
    id                      uuid
        constraint movies_pk primary key,
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