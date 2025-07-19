let map;
let markerLayers = {};
let allMarkers = [];

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.5, lng: 14.2 },
    zoom: 6,
  });

  const response = await fetch("https://w2h-json.netlify.app/location_export_de.json");
  const locations = await response.json();

  // Alle Kategorien sammeln
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
