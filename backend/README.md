# ITBio backend

### Requirements

- `gradle`
- `postgresql`


### Get up and running

```sh
# Create development database user:
$ createuser sefilm --interactive 
# answer y to make superuser

# Create database:
$ createdb sefilm -O sefilm

$ gradle flywayMigrate
$ gradle bootRun
```
