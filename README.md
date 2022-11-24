
# YelpCamp

A Node.js web Application

## Make sure you have these things installed

- Node

- MongoDB

- MLab (Alternative to downloading MongoDB locally) see the docs

## Features

- Authentication

Users can sign up or login using username and password.

User can not submit campgrounds if they are not logged in.

- Authorization

User can only modify campgrounds created by them.

- User Profile

Every registered user has profile where all his submitted campgrounds are shown.

- Basic Functionality

Add Name, Image and Description to the campground.

Create, Update, Delete the Campground.

Add comments to campgrounds.

Flash Important messages to warn or gree the users.

Responsive Web design.

## Built with
**Front end** : Bootstrap 5.0 ,  HTML , CSS , JS , ejs

**Back End** : Node. js , Express. js , MongoDB , mLAB , mongoose 
passport , passport-local , express-session , dotenv , connect-mongo

## Screenshots :
![Screenshot (148)](https://user-images.githubusercontent.com/88723277/203745530-3d78d2a7-7ab5-4148-9a18-5e5ce7249eae.png)
![Screenshot (149)](https://user-images.githubusercontent.com/88723277/203745537-470cd895-d94f-4e62-9ec7-9942734117d0.png)
![Screenshot (150)](https://user-images.githubusercontent.com/88723277/203745544-f4b16a6b-0903-496a-8789-99378bb0b6ff.png)

### Make sure your own .env file contains :

- CLOUDINARY_CLOUD_NAME 
- CLOUDINARY_KEY 
- CLOUDINARY_SECRET 
- MAPBOX_TOKEN 
- DB_URL
