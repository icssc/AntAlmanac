import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from "@material-ui/core/CircularProgress";
import {getGraph} from './FetchGraph'

function getModalStyle() {
    return {
      margin: 'auto',
      width: "65%",
      height: "50%",
      top: 50,
      backgroundColor: "white",
      borderRadius: "none",
      maxHeight:"80vh",
      overflow:"scroll",
    };
  }
  
const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tabsRoot: {
    borderBottom: '1px solid #e8e8e8',
  },
  tabsIndicator: {
    backgroundColor: '#1890ff',
  },
  tabRoot: {
    textTransform: 'initial',
    minWidth: 72,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing.unit * 4,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      color: '#40a9ff',
      opacity: 1,
    },
    '&$tabSelected': {
      color: '#1890ff',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:focus': {
      color: '#40a9ff',
    },
  },
  tabSelected: {},
  typography: {
    padding: theme.spacing.unit * 3,
  },

});

class CustomizedTabs extends React.Component {
  state = {
    value: 0,
    graph:'',
    load:0
  };
//_____________________________________
askForCourseCode = async(term) =>{
  const dept = this.props.term.dept;
  const url = new URL("https://websocserver.herokuapp.com/");
  const params = {department: dept, term: term};
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const res = await fetch(url.toString());
  const data = await res.json();
  return data;
}
//___________________________________________________
  handleChange = (event, value) => {
  this.setState({ value, load:1});
  
  if(value === 2){
     getGraph("f", "18",this.props.code[0],(x) => {this.setState({graph:x,load:0});})
}
  else if(value === 1){
    this.askForCourseCode("2018 Spring").then(responses =>{
    const courseCode = this.parseServeResponse(CustomizedTabs.flatten(responses))
      getGraph("s", "18",courseCode,(x) => {this.setState({graph:x,load:0});})
    });
  }
  else if(value === 0)
  {
    this.handleAction();
  }
}

parseServeResponse = (arrayOfClasses) =>{
  let code = null;
  console.log(arrayOfClasses)
  for (let e of arrayOfClasses)
  {
    if(this.props.courseDetails.name[0] === e.name[0]){
      console.log(this.props.courseDetails.name[0]);
      console.log(e.name[0])
      code = e.sections[0].classCode
      break;
    }
  }
  if(!code){
    console.log("this course was not offed that term")
    code = '555'
  }
  console.log(code)
  return code;
}

  static flatten(data) {
    return data.reduce((accumulator, school) => {
        accumulator.push(school);

        school.departments.forEach((dept) => {
            accumulator.push(dept);

            dept.courses.forEach((course) => {
                accumulator.push(course);
            })
        });
        return accumulator;
    }, [])
}

handleAction = () =>{
  this.setState({ load:1});
  this.askForCourseCode("2018 Winter").then(responses =>{
  const courseCode = this.parseServeResponse(CustomizedTabs.flatten(responses))
  getGraph("w", "18",courseCode,(x) => {this.setState({graph:x,load:0});})
    });  
   
}
 whatToRender = () => {
  if (this.state.load === 1) {
  return( <div style={{height: '100%', width: '100%', display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'}}><CircularProgress size={50}/></div>)
    }
    else{
     return <div style={getModalStyle()} dangerouslySetInnerHTML={{__html: this.state.graph}} />
    }
 }
  render() {
    console.log(this.state,"\nPROPS",this.props)
    const { classes } = this.props;
    const { value } = this.state;
   
    
    return (
      <div className={classes.root}>
        <Tabs 
          centered = {true}
          value={value}
          action={this.handleAction}
          onChange={this.handleChange}
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
        >
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Winter 18"
          />
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Spring 18"
          />
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Fall 18"
          />
        </Tabs>
        {this.whatToRender()}
      </div>
        )
  }
}
CustomizedTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(CustomizedTabs);

 // const year = (this.props.term.term).substring(2,4);
    //const quarter = (this.props.term.term)[5];
