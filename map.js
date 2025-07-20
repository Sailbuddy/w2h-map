let map;
let markerLayers = {};
let allMarkers = [];
let infoWindow; // globales InfoWindow, nur eins pro Karte

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.5, lng: 14.2 },
    zoom: 6,
  });

  // Gemeinsames InfoWindow vorbereiten
  infoWindow = new google.maps.InfoWindow();

  // Neue, korrekte URL zur JSON-Datei
  const response = await fetch("https://w2h-json-exports.netlify.app/data/locations.json");
  const locations = await response.json();

  // Alle Kategorien sammeln (deutsche Namen als Layer-Namen)
  const categories = [...new Set(locations.map(loc => loc.category_name_de))];

  // UI erzeugen
  const layerToggle = document.getElementById("layerToggle");
  categories.forEach(category => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.className = "layer-checkbox";
    checkbox.dataset.category = category;

    const label = document.createElement("label");
    label.textContent = category;
    label.prepend(checkbox);
    layerToggle.appendChild(label);

    markerLayers[category] = [];
    checkbox.addEventListener("change", () => updateMarkersVisibility());
  });

  // Marker erzeugen
  locations.forEach(loc => {
    const marker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map: map,
      title: loc.display_name || "Ort",
    });

    // Klick auf Marker → InfoWindow öffnen
    marker.addListener("click", () => {
      infoWindow.setContent(`<strong>${loc.display_name || "Ort"}</strong>`);
      infoWindow.open(map, marker);
    });

    markerLayers[loc.category_name_de].push(marker);
    allMarkers.push(marker);
  });
}

function updateMarkersVisibility() {
  for (const [category, markers] of Object.entries(markerLayers)) {
    const checkbox = document.querySelector(`input[data-category="${category}"]`);
    const visible = checkbox?.checked;
    markers.forEach(marker => marker.setVisible(visible));
  }
}
