// Stil für cleane Karte mit Wasserfarbe & Straßennamen
const cleanMapStyle = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "on" }] // Straßennamen sichtbar
  },
  {
    featureType: "water",
    stylers: [{ color: "#b3d9ff" }]  // sanftes Wasserblau
  }
];

// Globale Map-Referenz für alle Funktionen
let map;

// Layer-Marker-Speicher
const layers = {};
const layerControlsContainer = document.getElementById("layer-controls");

// Layerpanel ein-/ausblenden
document.getElementById("layer-toggle").addEventListener("click", () => {
  const panel = document.getElementById("layer-panel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 44.83762, lng: 13.12146 },
    zoom: 8,
    mapTypeId: "roadmap",
    styles: cleanMapStyle
  });

  try {
    const lang = navigator.language.slice(0, 2); // z. B. "de", "en"
    const validLangs = ["de", "en", "fr", "it", "hr"];
    const language = validLangs.includes(lang) ? lang : "en";

    // ✅ Geänderter Pfad (ohne /public/)
    const response = await fetch(`https://w2h-json.netlify.app/data/locations_${language}.json`);
    if (!response.ok) throw new Error("Fehler beim Laden der Daten");

    const locations = await response.json();

    if (!Array.isArray(locations) || locations.length === 0) {
      console.warn("Keine Marker gefunden.");
      return;
    }

    locations.forEach((item) => {
      if (!item.lat || !item.lng) return;

      const cat = item.category_name || "Unkategorisiert";

      const marker = new google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map,
        title: item.display_name || "Unbenannter Ort"
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

      // Layer-Verwaltung
      if (!layers[cat]) {
        layers[cat] = [];
        createLayerToggle(cat);
      }

      layers[cat].push(marker);
    });

    console.log(`${locations.length} Marker geladen.`);
  } catch (error) {
    console.error("Fehler beim Initialisieren der Karte:", error);
  }
}

// Sichtbarkeit steuern
function toggleLayer(cat, visible) {
  layers[cat].forEach(marker => marker.setMap(visible ? map : null));
}

// UI-Element für Layer erzeugen
function createLayerToggle(cat) {
  const label = document.createElement("label");
  label.innerHTML = `
    <input type="checkbox" checked onchange="toggleLayer('${cat}', this.checked)"> ${cat}
  `;
  layerControlsContainer.appendChild(label);
}

// 🧭 Google API Callback-Zuweisung
window.initMap = initMap;
