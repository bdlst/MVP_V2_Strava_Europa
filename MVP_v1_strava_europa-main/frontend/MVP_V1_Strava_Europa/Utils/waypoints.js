// utils/waypoints.js

export const relabelWaypoints = (wps) => {
  const start = wps.find(p => p.role === 'start');
  const end = wps.find(p => p.role === 'end');
  const middle = wps.filter(p => p.role === 'waypoint');

  const labelled = [];

  if (start) {
    labelled.push({
      ...start,
      label: `📍 ${start.coords.lat.toFixed(4)}, ${start.coords.lng.toFixed(4)}`
    });
  }

  middle.forEach((wp, i) => {
    labelled.push({
      ...wp,
      label: `📍 ${wp.coords.lat.toFixed(4)}, ${wp.coords.lng.toFixed(4)}`,
      displayIndex: i + 1
    });
  });

  if (end) {
    labelled.push({
      ...end,
      label: `📍 ${end.coords.lat.toFixed(4)}, ${end.coords.lng.toFixed(4)}`
    });
  }

  return labelled;
};

