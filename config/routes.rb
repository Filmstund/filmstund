Rails.application.routes.draw do
  resources :gift_cards
  resources :orders
  get '/random_bioord' => 'bioord#random'
  resources :showings do
    member do
      post 'complete'
      post 'attend'
      post 'unattend'
      post 'order'
    end
    resources :time_slots do
      collection do
        get 'votes'
        post 'votes', action: :add_vote
      end
    end
    member do
      get 'between/:from/:to', action: :between
    end
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
    member do
      get 'between/:from/:to', action: :between
    end
  end

  post '/authenticate' => 'sessions#create'
  get '/signout' => 'sessions#destroy', :as => :signout
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
