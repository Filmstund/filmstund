# ITBio backend

### Requirements

- `gradle`
- `mongodb`

### Get up and running
First, start MongoDB.

Then start Gradle:
```sh
$ google_clientSecret=<OAUTH2 APP SECRET GOES HERE>
$ google_redirectUri=http://localhost:8080/login/google # Optional in development
$ login_redirectUri=http://localhost:3000/user          # Optional in development
$ ./gradlew bootRun
```
or in one line:
```sh
$ google_clientSecret=<OAUTH2 APP SECRET GOES HERE> gradle bootRun
```
