// utils/geo.js
export const exportGeoJSON = (track) => {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: track.map(([lat, lng]) => [lng, lat]) // GeoJSON = [lng, lat]
    },
    properties: {
      timestamp: new Date().toISOString(),
    }
  };
};
