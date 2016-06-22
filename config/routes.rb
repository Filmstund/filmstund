Rails.application.routes.draw do
  resources :gift_cards
  resources :orders
  get '/random_bioord' => 'bioord#random'
  resources :time_slots
  resources :showings
  resources :users
  get '/me' => 'users#me'

  resources :movies, only: [:index, :show] do
    collection do
      get 'toplist'
      get 'upcoming'
      get 'current'
    end
  end

  post '/authenticate' => 'sessions#create'
  get '/signout' => 'sessions#destroy', :as => :signout
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
