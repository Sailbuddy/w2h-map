let map;
let infoWindow;
let markerLayers = {};
let layerPanelVisible = false;

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.5, lng: 15.0 },
    zoom: 7,
  });

  infoWindow = new google.maps.InfoWindow();

  const response = await fetch("https://w2h-json-exports.netlify.app/data/locations.json");
  const locations = await response.json();

  const categories = [...new Set(locations.map(loc => loc.category_name_de))];
  const layerControls = document.getElementById("layer-controls");

  categories.forEach(category => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.dataset.category = category;

    const label = document.createElement("label");
    label.textContent = category;
    label.prepend(checkbox);
    layerControls.appendChild(label);

    markerLayers[category] = [];
    checkbox.addEventListener("change", updateMarkersVisibility);
  });

  locations.forEach(loc => {
    const marker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map,
      title: loc.display_name || "Ort",
    });

    marker.addListener("click", () => {
      infoWindow.setContent(`<strong>${loc.display_name || "Ort"}</strong>`);
      infoWindow.open(map, marker);
    });

    markerLayers[loc.category_name_de].push(marker);
  });
}

function updateMarkersVisibility() {
  for (const [category, markers] of Object.entries(markerLayers)) {
    const checkbox = document.querySelector(`input[data-category="${category}"]`);
    const visible = checkbox?.checked;
    markers.forEach(marker => marker.setVisible(visible));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("layer-toggle");
  const panel = document.getElementById("layer-panel");

  toggle.addEventListener("click", () => {
    layerPanelVisible = !layerPanelVisible;
    panel.style.display = layerPanelVisible ? "block" : "none";
  });
});
