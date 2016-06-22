class AddTitleEtcToMovie < ActiveRecord::Migration[5.0]
  def change
    add_column :movies, :title, :string
    add_column :movies, :description, :text
    add_column :movies, :runtime, :integer
    add_column :movies, :poster, :string
    add_column :movies, :premiere_date, :datetime
    add_column :movies, :tagline, :string
    add_column :movies, :genres, :string
  end
end
