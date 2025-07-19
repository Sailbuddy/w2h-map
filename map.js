let map;
let allMarkers = [];
let activeCategories = new Set();
let allLocations = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 45.0, lng: 15.0 },
    zoom: 6,
  });

  fetch("data/locations_de.json")
    .then(res => res.json())
    .then(data => {
      allLocations = data;
      setupCategoryUI(data);
      loadMarkers();
    })
    .catch(err => console.error("Fehler beim Laden der JSON:", err));
}

function setupCategoryUI(locations) {
  const container = document.getElementById("layerControl");
  const categories = [...new Set(locations.map(l => l.category_name_de))].sort();

  categories.forEach(cat => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = true;
    cb.value = cat;

    cb.addEventListener("change", () => {
      if (cb.checked) {
        activeCategories.add(cat);
      } else {
        activeCategories.delete(cat);
      }
      loadMarkers();
    });

    label.appendChild(cb);
    label.append(` ${cat}`);
    container.appendChild(label);

    activeCategories.add(cat);
  });
}

function loadMarkers() {
  // Entferne alte Marker
  allMarkers.forEach(marker => marker.setMap(null));
  allMarkers = [];

  // Filtere Marker nach aktiven Kategorien
  allLocations.forEach(loc => {
    const cat = loc.category_name_de;
    if (!activeCategories.has(cat)) return;

    const marker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map,
      title: loc.display_name || loc.category_name_de,
    });

    allMarkers.push(marker);
  });
}
