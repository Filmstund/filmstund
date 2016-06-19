Rails.application.routes.draw do
  resources :bioord
  resources :time_slots
  resources :showings
  resources :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
