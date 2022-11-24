const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author:"62fd1aa5b69bce4a44f47d29",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude,
              ]
          },
            image: [
                {
                  url: 'https://res.cloudinary.com/kush16/image/upload/v1660969656/YelpCamp/ndfg7vxmx5gmqaubmn1c.jpg',
                  filename: 'YelpCamp/ndfg7vxmx5gmqaubmn1c',
                },
                {
                  url: 'https://res.cloudinary.com/kush16/image/upload/v1660969657/YelpCamp/j8bk4a2nya5wrm442pp7.jpg',
                  filename: 'YelpCamp/j8bk4a2nya5wrm442pp7',
                }
              ],
        })
        await camp.save();
    }
}

seedDB()

.then(() => {
    mongoose.connection.close();
})


 
