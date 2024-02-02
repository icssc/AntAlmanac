// import { useState } from 'react'
import './App.css'
import { ChakraProvider, Text, Center, Button, Stack } from '@chakra-ui/react'
import axios from 'axios';
import {useState} from 'react';

function App() {
  const [reg, setReg] = useState(null);
  const [sub, setSub] = useState(null);
  const publicVapidKey = "BOd2EQ8LTe3KAgMX9lWwTlHTRzv1Iantw50Mw6pUnsNr3pcxl8iglUs-YlQEQLo4UbJk9oyXs_BxgyAe0TCqKME";
  
  /*
    Registers the service worker, asks users to enable notifications on their browser
  */
  const registerServiceWorker = async () => {
    console.log('Registering!')
    const register = await navigator.serviceWorker.register('sw.js', {
        scope: '/'
    });
    setReg(register);
  }

  /*
    Send a push notification to subscribed users
  */
  const sendNotification = async () => {
    await fetch("http://localhost:5001/subscribe", {
      method: "POST",
      body: JSON.stringify(sub),
      headers: {
          "Content-Type": "application/json",
      }
  })
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
    setSub(subscription);
  }

  const testRouting = async () => {
    const test = await axios.get('http://localhost:5001/test');
    console.log("testing routing");
    console.log(test.data);
  }

  return (
    <>
    <ChakraProvider>
        <Stack>
          <Center>
            <Text fontSize="4xl">
              Webpush Demo
            </Text>
          </Center>
          <Button onClick={() => testRouting()} mt={3}>test routing</Button>
          <Button onClick={() => registerServiceWorker()} mt={3}>register for push notifications</Button>
          <Button onClick={() => subscribeUser()} mt={3}>subscribe for push notifications</Button>
          <Button onClick={() => sendNotification()} mt={3}>send push notifications to subscribers</Button>
        </Stack>
      </ChakraProvider>
    </>
  )
}

export default App;
