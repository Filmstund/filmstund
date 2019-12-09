FROM gcr.io/distroless/java:11
LABEL Description="Filmstund spring-boot backend"
COPY /app/build/libs/app.jar filmstund.jar
ENTRYPOINT ["java", "-Duser.language=sv_SE", "-Dfile.encoding=UTF-8", "-Duser.timezone=UTC", "-jar", "/filmstund.jar"]
