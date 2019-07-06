import firebase from 'firebase/app';
import '@firebase/messaging';

const firebaseConfig = {
  messagingSenderId: '321402942305',
};

export const initializeFirebase = () => {
  firebase.initializeApp(firebaseConfig);
};
export const pushNotifyForeground = () => {
  const messaging = firebase.messaging();
  messaging.onMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon,
    };

    if (!('Notification' in window)) {
      console.log('This browser does not support system notifications');
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      var notification = new Notification(
        notificationTitle,
        notificationOptions
      );
      notification.onclick = function(event) {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        window.open(payload.notification.click_action, '_blank');
        notification.close();
      };
    }
  });
};

export const askForPermissionToReceiveNotifications = async () => {
  try {
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log(token);
    return token;
  } catch (error) {
    console.error(error);
  }
};
