# Filmstund backend

### Requirements

- `gradle`
- `mongodb`
- `postgres`

### Get up and running
First, start MongoDB and postgres

Then start Gradle:
```sh
$ google_clientSecret=<OAUTH2 APP SECRET GOES HERE>
$ google_redirectUri=http://localhost:8080/login/google  # Optional in development
$ login_baseRedirectUri=https://your-deploy-domain.com   # Optional in development
$ login_defaultRedirectPath=user                         # The path you are redirected to after login (optional when developing)
$ tmdb_apikey=<YOUR_API_KEY_GOES_HERE>                   # Apply at https://www.themoviedb.org/ 
$ ./gradlew bootRun
```
or in one line:
```sh
$ google_clientSecret=<OAUTH2 APP SECRET GOES HERE> gradle bootRun
```
