export const handler = async (event) => {
  const path = event.rawPath || '/';
  const queryString = event.rawQueryString ? `?${event.rawQueryString}` : '';
  const redirectUrl = `https://antalmanac.com/planner${path}${queryString}`;

  return {
    statusCode: 301,
    headers: {
      Location: redirectUrl,
    },
    body: '',
  };
};

