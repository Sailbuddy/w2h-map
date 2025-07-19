let map;
let markers = [];
let categories = new Set();

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 45.8, lng: 15.95 },
    zoom: 6,
  });

  fetch("https://w2h-json.netlify.app/data/locations_de.json")
    .then(response => response.json())
    .then(data => {
      data.forEach(location => {
        const category = location.category_name_de;
        categories.add(category);

        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.display_name,
          category: category,
        });

        markers.push(marker);
      });

      renderCategoryFilter();
    })
    .catch(error => {
      console.error("Fehler beim Laden der JSON:", error);
    });
}

function renderCategoryFilter() {
  const container = document.getElementById("layerSelector");
  categories.forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${cat}" checked>
      ${cat}
    `;
    label.style.marginRight = "1em";
    container.appendChild(label);
  });

  container.addEventListener("change", () => {
    const selected = Array.from(
      container.querySelectorAll("input[type=checkbox]:checked")
    ).map(cb => cb.value);

    markers.forEach(marker => {
      if (selected.includes(marker.category)) {
        marker.setMap(map);
      } else {
        marker.setMap(null);
      }
    });
  });
}
