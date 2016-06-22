# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160622162605) do

  create_table "attendees", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "showing_id"
    t.boolean  "notify"
    t.string   "payment_method"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.index ["showing_id"], name: "index_attendees_on_showing_id"
    t.index ["user_id"], name: "index_attendees_on_user_id"
  end

  create_table "bioord", force: :cascade do |t|
    t.integer  "number"
    t.string   "phrase"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "gift_cards", force: :cascade do |t|
    t.integer  "owner_id"
    t.string   "number"
    t.string   "type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id"], name: "index_gift_cards_on_owner_id"
  end

  create_table "movies", primary_key: "sf_id", id: :string, force: :cascade do |t|
    t.string   "imdb_id"
    t.string   "themoviedb_id"
    t.string   "title"
    t.text     "description"
    t.integer  "runtime"
    t.string   "poster"
    t.datetime "premiere_date"
    t.string   "tagline"
    t.string   "genres"
    t.index ["sf_id"], name: "sqlite_autoindex_movies_1", unique: true
  end

  create_table "orders", force: :cascade do |t|
    t.string   "price"
    t.integer  "payer_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["payer_id"], name: "index_orders_on_payer_id"
  end

  create_table "orders_users", id: false, force: :cascade do |t|
    t.integer "order_id"
    t.integer "user_id"
    t.index ["order_id"], name: "index_orders_users_on_order_id"
    t.index ["user_id"], name: "index_orders_users_on_user_id"
  end

  create_table "showings", force: :cascade do |t|
    t.string   "sf_movie_id"
    t.integer  "status"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "showings_time_slots", id: false, force: :cascade do |t|
    t.integer "showing_id"
    t.integer "time_slot_id"
    t.index ["showing_id"], name: "index_showings_time_slots_on_showing_id"
    t.index ["time_slot_id"], name: "index_showings_time_slots_on_time_slot_id"
  end

  create_table "time_slots", force: :cascade do |t|
    t.time     "start_time"
    t.integer  "showing_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.string   "auditorium_name"
    t.integer  "auditorium_id"
    t.string   "theatre"
    t.boolean  "is_vip"
    t.boolean  "is_3d"
    t.index ["showing_id"], name: "index_time_slots_on_showing_id"
  end

  create_table "time_slots_users", id: false, force: :cascade do |t|
    t.integer "time_slot_id"
    t.integer "user_id"
    t.index ["time_slot_id"], name: "index_time_slots_users_on_time_slot_id"
    t.index ["user_id"], name: "index_time_slots_users_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string   "nick"
    t.string   "email"
    t.string   "bioklubbsnummer"
    t.string   "sf_membership_level"
    t.string   "phone_number"
    t.datetime "created_at",          null: false
    t.datetime "updated_at",          null: false
  end

  create_table "users_time_slots", id: false, force: :cascade do |t|
    t.integer "user_id"
    t.integer "time_slot_id"
    t.index ["time_slot_id"], name: "index_users_time_slots_on_time_slot_id"
    t.index ["user_id"], name: "index_users_time_slots_on_user_id"
  end

end
