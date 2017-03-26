# itbio backend

### Requirements

- `kotlin 1.1.1`
- `postgresql`
- `gradle`


### Get up and running

```sh
# create user:
createuser sefilm --interactive 
# answer y to make superuser

# create database:
createdb sefilm -O sefilm

gradle flywayMigrate
```