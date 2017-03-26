# itbio backend

### Requirements

- `kotlin 1.1.1`
- `postgresql`
- `gradle`


### Get up and running

```sh
# Vreate development database user:
$ createuser sefilm --interactive 
# answer y to make superuser

# Create database:
$ createdb sefilm -O sefilm

$ gradle flywayMigrate
$ gradle bootRun
```
