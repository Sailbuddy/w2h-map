async function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.83762, lng: 13.12146 },
    zoom: 8,
    mapTypeId: "roadmap",
  });

  const response = await fetch("https://w2h-json.netlify.app/data/locations.json");
  const locations = await response.json();

  locations.forEach((item) => {
    if (!item.lat || !item.lng) return;

    const marker = new google.maps.Marker({
      position: { lat: item.lat, lng: item.lng },
      map,
      title: item.display_name || "Unbenannter Ort",
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-family:sans-serif;">
                  <strong>${item.display_name || "Unbenannter Ort"}</strong><br/>
                  Kategorie: ${item.category_name || "–"}
                </div>`
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}

// 🔧 WICHTIG!
window.initMap = initMap;
