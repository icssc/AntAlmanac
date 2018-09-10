import React, {Component} from 'react';
import {Fragment} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar';
import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import Paper from "@material-ui/core/Paper";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
import Popup from "../CustomEvents/Popup/Popup";
import Button from "@material-ui/core/Button";
import gapi from 'gapi-client';
import {
    red,
    pink,
    purple,
    indigo,
    deepPurple,
    blue,
    green,
    cyan,
    teal,
    lightGreen,
    lime,
    amber,
    blueGrey
} from '@material-ui/core/colors';



const arrayOfColors = [red[500], pink[500],
    purple[500], indigo[500],
    deepPurple[500], blue[500],
    green[500], cyan[500],
    teal[500], lightGreen[500],
    lime[500], amber[500],
    blueGrey[500]];

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: null,
            schedule0Events: [],
            schedule1Events: [],
            schedule2Events: [],
            schedule3Events: [],
            currentScheduleIndex: 0,
            arrayOfColors0: arrayOfColors.slice(0),
            arrayOfColors1: arrayOfColors.slice(0),
            arrayOfColors2: arrayOfColors.slice(0),
            arrayOfColors3: arrayOfColors.slice(0)
        };

        this.updateFormData = this.updateFormData.bind(this);
        this.handleAddClass = this.handleAddClass.bind(this);
        this.handleClassDelete = this.handleClassDelete.bind(this);
        this.handleScheduleChange = this.handleScheduleChange.bind(this);
    }

    handleClassDelete(title) {
        let colorFound = false;

        const classEventsInCalendar = this.state['schedule' + this.state.currentScheduleIndex + 'Events'].filter(
            event => {
                if (!colorFound && event.title === title && event.color !== undefined) {
                    this.setState({['arrayOfColors' + this.state.currentScheduleIndex]: this.state['arrayOfColors' + this.state.currentScheduleIndex].concat(event.color)});
                    colorFound = true;
                }
                return event.title !== title;
            }
        );
        this.setState({['schedule' + this.state.currentScheduleIndex + 'Events']: classEventsInCalendar});
    }

    handleAddClass(section, name, scheduleNumber) {
        if (scheduleNumber === 4) {
            this.handleAddClass(section, name, 0);
            this.handleAddClass(section, name, 1);
            this.handleAddClass(section, name, 2);
            this.handleAddClass(section, name, 3);
            return;
        }
        const arrayOfColorsName = 'arrayOfColors' + scheduleNumber;

        const randomColor = this.state[arrayOfColorsName][this.state[arrayOfColorsName].length - 1];

        const checkExist = this.state['schedule' + scheduleNumber + 'Events'].find((element) =>
            element.title === section.classCode + " " + name[0]
        );

        if (!checkExist) {
            this.setState({[arrayOfColorsName]: this.state[arrayOfColorsName].filter(color => color !== randomColor)});

            let newClasses = [];

            section.meetings.forEach(timeString => {
                timeString = timeString[0].replace(/\s/g, "");

                if (timeString !== 'TBA') {

                    let [_, dates, start, startMin, end, endMin, ampm] = timeString.match(/([A-za-z]+)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/);

                    start = parseInt(start, 10);
                    startMin = parseInt(startMin, 10);
                    end = parseInt(end, 10);
                    endMin = parseInt(endMin, 10);
                    dates = [dates.includes('M'), dates.includes('Tu'), dates.includes('W'), dates.includes('Th'), dates.includes('F')];

                    if (ampm === 'p' && end !== 12) {
                        start += 12;
                        end += 12;
                        if (start > end) start -= 12;
                    }

                    dates.forEach((shouldBeInCal, index) => {
                        if (shouldBeInCal) {
                            const newClass = {
                                color: randomColor,
                                title: section.classCode + " " + name[0],
                                start: new Date(2018, 0, index + 1, start, startMin),
                                end: new Date(2018, 0, index + 1, end, endMin)
                            };
                            newClasses.push(newClass);
                        }
                    });
                }
            });

            this.setState({['schedule' + scheduleNumber + 'Events']: this.state['schedule' + scheduleNumber + 'Events'].concat(newClasses)});
        }
    }

    handleScheduleChange(direction) {
        if (direction === 0) {
            if (this.state.currentScheduleIndex === 0)
            {
                this.setState({currentScheduleIndex: 3});
            } 
            else {
                this.setState({currentScheduleIndex: this.state.currentScheduleIndex - 1});
            }
        } else if (direction === 1)
         {
            if (this.state.currentScheduleIndex === 3) {
                this.setState({currentScheduleIndex: 0});
            }
            else {
                this.setState({currentScheduleIndex: this.state.currentScheduleIndex + 1});
            }
        }
    }

    
    updateFormData(formData) {
        this.setState({formData: formData});
    }

    handleCustemTime(obj,calendarIndex)
    {
        // why 11? r u gonna have 11 calendars! grow up. ref popup.js line 153
        if(calendarIndex === 11){
            this.setState({['schedule' + 0 + 'Events']: this.state['schedule' + 0 + 'Events'].concat(obj)});
            this.setState({['schedule' + 1 + 'Events']: this.state['schedule' + 1 + 'Events'].concat(obj)});
            this.setState({['schedule' + 2 + 'Events']: this.state['schedule' + 2 + 'Events'].concat(obj)});
            this.setState({['schedule' + 3 + 'Events']: this.state['schedule' + 3 + 'Events'].concat(obj)});

        }
        else{
            this.setState({['schedule' + calendarIndex + 'Events']: this.state['schedule' + calendarIndex + 'Events'].concat(obj)});
        }
    }

    handleImportToGoogleCalendar() {
        //const schedule = [...this.state.schedule0Events];
        
        let event = {
            'summary': 'title here' ,//schedule[0].title,
            'location': 'Not avaliable',
            'description': 'Latter',
            'start': {
              'dateTime': '2018-08-30T09:00:00-07:00',// schedule[0].start.toISOString(),
              'timeZone': 'America/Los_Angeles',
            },
            'end': {
              'dateTime': '2018-08-30T11:00:00-07:00',// schedule[0].end.toISOString(),
              'timeZone': 'America/Los_Angeles',
            },
            'recurrence': [
              'RRULE:FREQ=DAILY;COUNT=2'
            ],  
        };
        
        const fs = require('fs');
        const readline = require('readline');

        console.log("the button clicked");
      //  const {google} = require('googleapis'); 
        console.log("the button clicked"); 
        
        const SCOPES = 'https://www.googleapis.com/auth/calendar';
        const TOKEN_PATH = '';
       
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), listEvents);
          });
       
          /**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new gapi.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  function listEvents(auth) { 
   const calendar = gapi.calendar({version: 'v3'});
    calendar.events.insert({
      auth:auth,
      calendarId: 'primary',
      resource: event,
    }, (err, res) => {
      if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
      }
      console.log('Event created: %s', event.htmlLink);
    });
  } 

      /*  calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
          }, function(err, event) {
            if (err) {
              console.log('There was an error contacting the Calendar service: ' + err);
              return;
            }
            console.log('Event created: %s', event.htmlLink);
          }); */
    }

    render() {
        if( this.state.schedule0Events.length >0){
       let x = this.state.schedule0Events[0].start;
       let z =3;// x.toISOString();
        console.log(this.state,"STATATATAT");
        }
        console.log(this.state,"STATATATAT");

        return (
            <Fragment>
                <CssBaseline/>
                <AppBar position='static'>
                    <Toolbar variant='dense'>
                        <Typography variant="title" color="inherit" style={{flexGrow: 1}}>AntAlmanac</Typography>
                        <Button color="inherit">Load Schedule</Button>
                        <Button color="inherit">Save Schedule</Button>
                    </Toolbar>
                </AppBar>
                <Grid container>
                    <Grid item lg={12}>
                        <SearchForm updateFormData={this.updateFormData}/>
                    </Grid>
                    <Grid item lg={6} xs={12}>
                        <div style={{margin: '10px 5px 0px 10px'}}>

                        <Popup callback={this.handleCustemTime.bind(this)}/>
                        
                            <Calendar classEventsInCalendar={this.state['schedule' + this.state.currentScheduleIndex + 'Events']}
                                      currentScheduleIndex={this.state.currentScheduleIndex}
                                      onClassDelete={this.handleClassDelete}
                                      onScheduleChange={this.handleScheduleChange}
                                      googleCalendar={this.handleImportToGoogleCalendar}/>
                        </div>
                    </Grid>

                    <Grid item lg={6} xs={12}>
                        <Paper
                            style={{height: '85vh', overflow: 'auto', margin: '10px 10px 0px 5px', padding: 10}}>
                            <CoursePane
                                formData={this.state.formData}
                                onAddClass={this.handleAddClass}
                                term = {this.state.formData}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default App;
