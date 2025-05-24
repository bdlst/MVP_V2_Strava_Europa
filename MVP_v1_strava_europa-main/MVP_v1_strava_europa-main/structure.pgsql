/App.js
/screens/
  ├── TrackingScreen.js      ← Suivi GPS + enregistrement trace
  ├── RouteBuilderScreen.js  ← Création d’itinéraire
/components/
  ├── MapViewer.js           ← Composant WebView Leaflet
  ├── StartStopButton.js     ← Bouton start/stop réutilisable
  ├── ExportGeoJSON.js       ← Fonctions d’export
/utils/
  ├── geo.js                 ← Conversion trace → GeoJSON, distance, etc.
  └── api.js                 ← Appels backend (bientôt)
