// campground is injected by the show.ejs template as a JS variable
const [lng, lat] = campground.geometry.coordinates;

const map = L.map('map').setView([lat, lng], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<strong>${campground.title}</strong><br>${campground.location}`)
    .openPopup();
