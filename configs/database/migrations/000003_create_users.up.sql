create table if not exists users
(
    id                       uuid
        constraint user_pk primary key               default uuid_generate_v4(),
    subject_id               varchar(50)  not null
        constraint user_ids_subjct_uniq unique,
    filmstaden_membership_id varchar(15)  null
        constraint user_ids_fsid_uniq unique,
    first_name               varchar(100) not null,
    last_name                varchar(100) not null,
    nick                     varchar(50),
    email                    varchar(100) not null,
    phone                    varchar(13)  null,
    avatar                   varchar(255) null,
    calendar_feed_id         uuid
        constraint user_calendarfeedid_unique unique default uuid_generate_v4(),
    last_login_time          timestamp    not null   default current_timestamp,
    signup_time              timestamp    not null   default current_timestamp,
    update_time              timestamp    not null   default current_timestamp
);