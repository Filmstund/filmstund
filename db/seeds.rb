# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Bioord.create!([
  {
    "phrase" => "Du skall icke spoila",
    "number" => 1
  },
  {
    "phrase" => "Låt din nästa se på bio såsom du själv skulle vilja se på bio",
    "number" => 2
  },
  {
    "phrase" => "Du skall icke späda din cola",
    "number" => 3
  },
  {
    "phrase" => "Det skall alltid finnas något att nomma på",
    "number" => 4
  },
  {
    "phrase" => "Du skola icke låta teoretiska biopoäng gå till spillo",
    "number" => 5
  },
  {
    "phrase" => "Du skall inga andra biogudar hava vid sidan av mig",
    "number" => 6
  },
  {
    "phrase" => "Du skall offra vart hundrade popcorn till din nästa",
    "number" => 7
  },
  {
    "phrase" => "Tänk på biodagen så att du helgar den",
    "number" => 8
  },
  {
    "phrase" => "Du skall icke stjäla din grannes popcorn utan vänta tryggt på ditt hundrade",
    "number" => 9
  },
  {
    "phrase" => "Du skall icke frestas av 3D, ty det är djävulens påfund",
    "number" => 10
  },
  {
    "phrase" => "Tag icke med en bebis",
    "number" => 37
  }
])
Movie.create!([
  {sf_id: "77049680", imdb_id: "tt3110958", themoviedb_id: "291805", title: "Now You See Me 2", description: "One year after outwitting the FBI and winning the ...", runtime: 129, poster: "https://mobilebackend.sfbio.se/image/POSTER/512/-/...", premiere_date: "2016-06-14 22:00:00", tagline: "You Haven't Seen Anything Yet", genres: "Action,Comedy,Thriller"},
  {sf_id: "49000928", imdb_id: "tt1489889", themoviedb_id: "302699", title: "Central Intelligence", description: "After he reunites with an old pal through Facebook...", runtime: 108, poster: "https://mobilebackend.sfbio.se/image/POSTER/512/-/...", premiere_date: "2016-06-16 22:00:00", tagline: "Saving the world takes a little Hart and a big Joh...", genres: "Action,Comedy"}
  ])
Showing.create!([
  {
    "sf_id" => "77049680",
    "status" => 1,
  },
  {
    "sf_id" => "49000928",
    "status" => 1
  }
])
