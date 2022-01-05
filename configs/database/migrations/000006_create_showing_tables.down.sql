BEGIN TRANSACTION;
drop table if exists tickets;
drop table if exists attendees;
drop table if exists showings;
drop table if exists cinema_screens;
COMMIT TRANSACTION;
