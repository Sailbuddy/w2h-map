let map;
let layerPanelVisible = false;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.0, lng: 15.0 },
    zoom: 7,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("layer-toggle");
  const panel = document.getElementById("layer-panel");

  toggle.addEventListener("click", () => {
    layerPanelVisible = !layerPanelVisible;
    panel.style.display = layerPanelVisible ? "block" : "none";
  });
});
