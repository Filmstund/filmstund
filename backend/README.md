# ITBio backend

### Requirements

- `gradle`
- `mongodb`

### Get up and running
First, start MongoDB.

Then start Gradle:
```sh
$ google_clientSecret=<OAUTH2 APP SECRET GOES HERE>
$ google_redirectUri=http://localhost:8080/login/google  # Optional in development
$ login_baseRedirectUri=https://your-deploy-domain.com   # Optional in development
$ login_defaultRedirectPath=user                         # The path you are redirected to after login (optional when developing)
$ sefilm.tmdb.apikey=<YOUR_API_KEY_GOES_HERE>            # Optional, but application will not work correctly without it
$ ./gradlew bootRun
```
or in one line:
```sh
$ google_clientSecret=<OAUTH2 APP SECRET GOES HERE> gradle bootRun
```
