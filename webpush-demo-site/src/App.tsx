// import { useState } from 'react'
import './App.css'
import { ChakraProvider, Text, Center, Button, Stack } from '@chakra-ui/react'
import axios from 'axios';
import {useState} from 'react';

function App() {
  const [reg, setReg] = useState('')
  const publicVapidKey = "BOd2EQ8LTe3KAgMX9lWwTlHTRzv1Iantw50Mw6pUnsNr3pcxl8iglUs-YlQEQLo4UbJk9oyXs_BxgyAe0TCqKME";
  
  const registerServiceWorker = async () => {
    console.log('Registering!')
    const register = await navigator.serviceWorker.register('sw.js', {
        scope: '/'
    });
    setReg(register);


  }

  const pushNotification = async () => {
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicVapidKey,
  });

  await fetch("http://localhost:5001/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
          "Content-Type": "application/json",
      }
  })
  }

  const testRouting = async () => {
    const test = await axios.get('http://localhost:5001/test');
    console.log("test successful");
    console.log(test.data);
  }

  const handleTestClick = () => {
    console.log("Click!");
    testRouting();
  }

  const handleRegisterClick = () => {
    console.log("Registering!")
    registerServiceWorker();
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
          <Button onClick={handleTestClick} mt={3}>test routing</Button>
          <Button onClick={handleRegisterClick} mt={3}>register for push notifications</Button>
          <Button onClick={() => pushNotification()} mt={3}>push a notifications</Button>
        </Stack>
      </ChakraProvider>
    </>
  )
}

export default App;
