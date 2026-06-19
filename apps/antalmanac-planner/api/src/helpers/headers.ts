export const ANTEATER_API_REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
};
