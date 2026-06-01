// campgrounds GeoJSON is injected by index.ejs
const map = L.map('cluster-map').setView([40.6699, -103.5917], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

const markers = L.markerClusterGroup();

for (const feature of campgrounds.features) {
    if (!feature.geometry) continue;
    const [lng, lat] = feature.geometry.coordinates;
    const marker = L.marker([lat, lng]);
    if (feature.properties.popUpMarkup) {
        marker.bindPopup(feature.properties.popUpMarkup);
    }
    markers.addLayer(marker);
}

map.addLayer(markers);
