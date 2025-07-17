exports.handler = async function () {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY,
    }),
  };
};