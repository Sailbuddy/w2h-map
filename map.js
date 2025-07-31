
// Kombiniert: Layersteuerung + Infofenster (Name, Beschreibung, Kategorie, Link)
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

  const response = await fetch("https://w2h-json.netlify.app/location_export_en.json");
  const locations = await response.json();

  const categories = [...new Set(locations.map(loc => loc.category_name_en))];
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
      title: loc.display_name || "Location"
    });

    const name = loc.display_name || "Unnamed Location";
    const desc = loc.description_en || "No description available.";
    const category = loc.category_name_en || "Uncategorized";
    const link = loc.maps_url || loc.website || null;

    const html = `
      <div style="max-width:240px;">
        <h3 style="margin-top:0;">${name}</h3>
        <p style="margin:0;"><strong>Category:</strong> ${category}</p>
        <p style="margin-top:8px;">${desc}</p>
        ${link ? `<p><a href="${link}" target="_blank">🗺️ View on map</a></p>` : ""}
      </div>
    `;

    marker.addListener("click", () => {
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });

    if (!markerLayers[category]) {
      markerLayers[category] = [];
    }
    markerLayers[category].push(marker);
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
