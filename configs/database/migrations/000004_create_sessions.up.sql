create table if not exists sessions
(
    id                 uuid
        constraint sessions_pk primary key,
    user_id            uuid        not null,
    refresh_token      varchar(50) not null,
    principal          bytea       not null,
    expiration_date    timestamp   not null default current_timestamp + interval '30' day,
    created_date       timestamp   not null default current_timestamp,
    last_modified_date timestamp   not null default current_timestamp,

    constraint sessions_users_fk
        foreign key (user_id)
            references users (id)
);
