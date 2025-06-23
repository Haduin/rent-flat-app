FROM gradle:8.5-jdk21 AS build
WORKDIR /app
COPY . /app/
RUN gradle clean jar --no-daemon --info

FROM openjdk:21-slim
WORKDIR /app
#COPY .env.prod /app/.env
COPY --from=build /app/build/libs/backend.jar /app
EXPOSE 8080
#CMD ["/bin/sh", "-c", ". /app/.env && java -jar backend.jar"]
CMD ["java","-jar","backend.jar"]