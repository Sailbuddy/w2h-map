async function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.83762, lng: 13.12146 },
    zoom: 8,
    mapTypeId: "roadmap",
  });

  try {
    const response = await fetch("https://w2h-json-exports.netlify.app/data/locations.json");
    if (!response.ok) throw new Error("Fehler beim Laden der Daten");

    const locations = await response.json();

    if (!Array.isArray(locations) || locations.length === 0) {
      console.warn("Keine Marker gefunden.");
      return;
    }

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

    console.log(`${locations.length} Marker geladen.`);
  } catch (error) {
    console.error("Fehler beim Initialisieren der Karte:", error);
  }
}

// 🔧 WICHTIG!
window.initMap = initMap;
