Rails.application.routes.draw do
  resources :gift_cards
  resources :orders
  get '/random_bioord' => 'bioord#random'
  resources :showings do
    resources :time_slots
  end

  resources :users, only: :show
  get '/me' => 'users#me'
  put '/me' => 'users#update'
  delete '/me' => 'users#destroy'

  resources :movies, only: [:index, :show, :update] do
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
