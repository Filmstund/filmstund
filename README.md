# ITBio
A web application for making it easier going to the cinema with your friends

## How to start development
Install ruby with your favorite package manager

```sh
$ gem install ruby
$ git clone <this-repo>
$ cd <this-repo>
$ bundle
$ rails db:migrate
$ touch tmp/caching-dev.txt  # Without this you're going to have a bad time...
$ cp config/secrets.yml.example config/secrets.yml
$ vim config/secrets.yml   # Add your API-key to themoviedb_api: xxxxx
$ cd frontend/
$ npm install
<vänta...>
$ npm start
<koda koden!>
$ bin/rails s -b 127.0.0.1
<kolla localhost:8080>
<profit?>
```
