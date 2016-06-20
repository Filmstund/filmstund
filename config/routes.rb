Rails.application.routes.draw do
  resources :gift_cards
  resources :orders
  get '/random_bioord' => 'bioord#random'
  resources :time_slots
  resources :showings
  resources :users

  resources :movies, only: [:index, :show] do
    collection do
      get 'toplist'
      get 'upcoming'
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
