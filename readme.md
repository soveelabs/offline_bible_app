#### Requirements
* Node/ NPM
* MongoDB

#### Setup
* Make Sure you have docker-compose setup
```
docker-compose build
docker-compose run app npm install
docker-compose up
```

#### Note
* To see which port your app is running on run
```
docker-compose ps
``` 

#### Testing
```
docker-compose run app npm test
```
