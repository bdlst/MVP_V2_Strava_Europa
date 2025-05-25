/*const GRAPH_HOPPER_API_KEY = "c3a5a259-4148-46fd-a65d-114628fb385c"; // Crée un compte gratuit sur graphhopper.com

export async function getRoute({ start, end, mode = 'foot' }) {
  try {
    const url = 'https://graphhopper.com/api/1/route';
    const body = {
      points: [
        [start[1], start[0]], // [lng, lat]
        [end[1], end[0]]      // [lng, lat]
      ],
      profile: mode,
      locale: 'fr',
      instructions: false,
      calc_points: true,
      points_encoded: false,
    };

    const response = await fetch(`${url}?key=${GRAPH_HOPPER_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.paths || data.paths.length === 0) {
      console.warn('GraphHopper a répondu sans itinéraire :', JSON.stringify(data));
      return [];
    }

    return data.paths[0].points.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch (error) {
    console.error('Erreur GraphHopper :', error);
    return [];
  }
}*/

export async function getRoute({ start, end, waypoints = [], mode = 'foot' }) {
  const GRAPH_HOPPER_API_KEY = "c3a5a259-4148-46fd-a65d-114628fb385c";
  try {
    const allPoints = [start, ...waypoints, end].map(([lat, lng]) => [lng, lat]);

    const response = await fetch(`https://graphhopper.com/api/1/route?key=${GRAPH_HOPPER_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        points: allPoints,
        profile: mode,
        locale: 'fr',
        instructions: false,
        calc_points: true,
        points_encoded: false
      }),
    });

    const data = await response.json();

    if (!data.paths || data.paths.length === 0) {
      console.warn('GraphHopper a répondu sans itinéraire :', JSON.stringify(data));
      return [];
    }

    return data.paths[0].points.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch (error) {
    console.error('Erreur GraphHopper :', error);
    return [];
  }
}

