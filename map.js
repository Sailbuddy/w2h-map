let map;
let markerLayers = {};
let infoWindow;

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 43.5, lng: 15.0 }, // 🎯 Adria-Fokus (Split)
    zoom: 7,                          // 🔍 Idealer Zoom für Küstenübersicht
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

  document.getElementById("layer-toggle").addEventListener("click", () => {
    const panel = document.getElementById("layer-panel");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
  });
}

function updateMarkersVisibility() {
  for (const [category, markers] of Object.entries(markerLayers)) {
    const checkbox = document.querySelector(`input[data-category="${category}"]`);
    const visible = checkbox?.checked;
    markers.forEach(marker => marker.setVisible(visible));
  }
}
