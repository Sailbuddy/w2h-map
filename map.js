// Kombiniert: Layersteuerung + Infofenster (Name & Beschreibung)
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
      title: loc.name_en || "Unnamed"
    });

    marker.addListener("click", () => {
      const name = loc.name_en || "Unnamed";
      const desc = loc.description_en || "No description available.";
      const html = `
        <div style="max-width:240px;">
          <h3 style="margin-top:0;">${name}</h3>
          <p style="margin-top:8px;">${desc}</p>
        </div>
      `;
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });

    const category = loc.category_name_en;
    if (!markerLayers[category]) {
      markerLayers[category] = [];
    }
    markerLayers[category].push(marker);
  });
}

function updateMarkersVisibility() {
  for (const [category, markers] of Object.entries(markerLayers)) {
    const checkbox = document.querySelector(`input[data-category="{category}"]`);
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
