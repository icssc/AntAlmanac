// import { useState } from 'react'
import './App.css'
import { ChakraProvider, Text, Center, Button, Stack, Flex, UnorderedList, ListItem } from '@chakra-ui/react'
import axios from 'axios';
import {useState, useRef} from 'react';

function App() {
  const [reg, setReg] = useState(null);
  const [sub, setSub] = useState(null);
  const [routeText, setRouteText] = useState('');
  const [registrationText, setRegistrationText] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [regular, setRegular] = useState(false);
  const publicVapidKey = "BOd2EQ8LTe3KAgMX9lWwTlHTRzv1Iantw50Mw6pUnsNr3pcxl8iglUs-YlQEQLo4UbJk9oyXs_BxgyAe0TCqKME";
  
  
  const testRouting = async () => {
    const test = await axios.get('http://localhost:5001/test');
    setRouteText(test.data.message);
  }

  /*
    Registers the service worker, asks users to enable notifications on their browser
  */
  const registerServiceWorker = async () => {
    console.log('Registering!')
    const register = await navigator.serviceWorker.register('sw.js', {
        scope: '/'
    });
    setReg(register);
    setRegistrationText("Service Worker Registered to scope '/'")
  }

  /*
    Calls subscribe route to subscribe a user to push notifications
    right now, just happens when the user presses the button
  */
    const subscribeUser = async () => {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey,
    });
    console.log("Successfully Subscribed")
      setSub(subscription);
      setSubscribed(true);
    }

    /*
      Unsubscribes a subscribed user from push notifications
    */
  const unsubscribeUser = async () => {
    navigator.serviceWorker.ready.then((reg) => { // makes sure the service worker is active
      reg.pushManager.getSubscription().then(() => {
        sub
          .unsubscribe()
          .then(() => {
            console.log("Successfully Unsubscribed")
            setSubscribed(false);
          })
          .catch(() => {
            // Unsubscribing failed
            console.log("Unsubscribing Failed, perhaps you did not subscribe yet?")
          });
      });
    });
  }

  /*
    Send a push notification to subscribed users
  */
    const sendNotification = async () => {
      await fetch("http://localhost:5001/notification", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: {
            "Content-Type": "application/json",
        }
    })
    }

  /* 
    Sends 5 push notifications
  */
  const setNotificationsRegularly = async () => {
    const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
    setRegular(true);
    while (5) {
      await sleep(10000);
      console.log("Sending!")
      await fetch("http://localhost:5001/notification", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: {
            "Content-Type": "application/json",
        }
    })
    }
  }

  // hard refresh - workaround or allow?

  return (
    <>
    <ChakraProvider>
        <Stack>
          <Center>
            <Text fontSize="4xl" mb="5rem">
              Webpush Demo
            </Text>
          </Center>
          <Button onClick={() => testRouting()} mt={3}>test routing</Button>
          <Text>{routeText}</Text>
          <Button onClick={() => registerServiceWorker()} mt={3}>register for push notifications</Button>
          <Text>{registrationText}</Text>
          <Flex gap={3}>
            <Button onClick={() => subscribeUser()} mt={3}>subscribe for push notifications</Button>
            <Button onClick={() => unsubscribeUser()} mt={3}>unsubscribe from push notifications</Button>
          </Flex>
          {subscribed ? <Text>Currently Subscribed to Push Notifications</Text> : <Text>Currently Unsubscribed from Push Notifications</Text>}
          <Button onClick={() => sendNotification()} mt={3}>send push notifications to subscribers</Button>
          <Button onClick={() => setNotificationsRegularly()} mt={3}>send five push notifications every 10 seconds</Button>
        </Stack>
      </ChakraProvider>
    </>
  )
}

export default App;
