# WebPush Demo
Demo for WebPush API

### Stack
- React.js + Vite
- Node.js + Express.js

### Running
Frontend:
- cd webpush-demo-site
- npm i
- npm run dev

Backend:
- cd webpush-demo-backend
- npm start

Backend requires Vapid keys to start. These can be self generated and added to server.js, or the private key can be found
in the AntAlmanac projects chat.

### Notification Settings
Demo is built for chrome, the user will be requested to enable notifications. If you do not get a request,
check your notification settings for the site and enable them. The demo does not currently work for Firefox
right now, and is undetermined if it works for other browsers.

