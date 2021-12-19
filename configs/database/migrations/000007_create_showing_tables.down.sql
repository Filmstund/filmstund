BEGIN TRANSACTION;
drop table if exists ticket;
drop table if exists attendee;
drop table if exists showings;
drop table if exists cinema_screens;
DROP table if exists locations_aliases;
DROP table if exists locations;
COMMIT TRANSACTION;
