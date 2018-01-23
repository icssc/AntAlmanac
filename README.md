# AntAlmanac
A tool that provides UCI anteaters with historical course information in a visual and inyuitive way to help with scheduling and course planning. With a long-term focus on course availability by quarter and registration history, The AntAlmanac enables student to make better academic course planning decisions. Through history enrollment graphs as well as past course offerings, UCI anteaters can pick courses without the anxiety!

The AntAlmanac is built using Python Flask, HTML + CSS, Javascript (jQuery and simple AngularJS), with a Redis database as the backend datastore.

Currently deployed at: https://antalmanac.herokuapp.com/

Note: The Heroku dyno that the AntAlmanac is currently hosted on goes to sleep after 30 minutes. When it is asleep, any request sent to it will require waking the dyno, which takes a considerable amount of time. That is why The AntAlmanac is so slow to load on the first try.

The AntAlmanac is still in a very early development phase...but stay tuned! Here is a list of things to expect:
<ul>
  <li>
    Data store implementation using PostgreSQL!
  </li>
  <li>
    Visual week-view course planner with custom events and multiple tabs for viewing multiple schedules (think AntPlanner but much better)
  </li>
  <li>
    Drag and drop four year plan maker with prerequisite checking and historical enrollment data
  </li>
  <li>
    Awesomeness in general
  </li>
</ul>
  
