import React from 'react'
// create a custom event on the calender
export const customEvent = props => {
   return( {color: 'blue',
     title: "title",
     start: new Date(2018, 0, 3, 8, 3),
     end: new Date(2018, 0, 3, 9, 44)
   })
};