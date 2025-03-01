/* eslint-disable no-undef */
const locations = JSON.parse(
  document.getElementById('map').dataset.locations,
);
console.log(locations);

var map = L.map('map').setView([34.124693, -118.113807], 13); // Default center

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const markers = [];
locations.forEach((loc) => {
  const { coordinates, day, description } = loc; // Extract coordinates & description
  if (coordinates.length === 2) {
    const marker = L.marker([coordinates[1], coordinates[0]]).addTo(map);

    // Add popup with day and description
    marker
      .bindPopup(
        `<b style="font-size: 18px;">Day ${day} ${description}</b>`,
      )
      .openPopup();

    markers.push(marker);
  }
});

// If multiple locations exist, adjust the map to fit all markers
if (markers.length > 0) {
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds(), { padding: [50, 50] }); // Adjust zoom to fit all markers
}
