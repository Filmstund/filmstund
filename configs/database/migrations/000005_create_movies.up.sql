create table movies
(
    id              uuid
        constraint movies_pk primary key,
    filmstaden_id   varchar(20)              not null
        constraint fsId_uniq unique,
    imdb_id         varchar(20)              null,
    tmdb_id         bigint                   null,
    slug            varchar(100)             not null,
    title           varchar(100)             not null,
    release_date    date                     null,
    production_year integer                  not null default 1900
        constraint productionyear_nonneg check (production_year >= 1900),
    runtime         int                      not null default 0
        constraint runtime_nonneg check (movies.runtime >= 0),
    poster          varchar(255)             null,
    genres          varchar(100)[]           not null default '{}',
    archived        boolean                  not null default false,
    update_time     timestamp with time zone not null default current_timestamp,
    create_time     timestamp with time zone not null default current_timestamp
);