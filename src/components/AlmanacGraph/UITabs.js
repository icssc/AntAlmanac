import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from "@material-ui/core/CircularProgress";
import Table from './Table'
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function getModalStyle() {
    return {
      margin: 'auto',
      width: "65%",
      height: "50%",
      top: 50,
      backgroundColor: "white",
      borderRadius: "none",
     
     
    };
  }
  
const styles = theme => ({
  root: {
    flexGrow: 0,
    backgroundColor: theme.palette.background.paper,
    maxHeight:"80vh",
    overflow:"scroll"
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
      color: '#b78727',
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
    load:0,
    graphWinter:[],
    graphSpring:[],
    graphFall:[],
    courseForTableSpring:[],
    courseForTableWinter:[],
    courseForTableFall:[]
  };
//_____________________________________
/**
 * @param  term which want to get courses for, 2018 Fall, or 2018 Spring
 * @return call calssObject() which return the course object or -1
 */
askForCourseCode = async(term) =>{
  const params = {department: this.props.term.dept, term: term};
  const url = new URL("https://websocserver.herokuapp.com/");
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const res = await fetch(url).then((response) => response.json())
  const data = [...res[0].departments[0].courses]
  //console.log(data);
  return this.classObject(data);
}
//___________________________________________________________________
/**
 * @param courses Json from askForCourseCode
 * @return course whih include comment, name, sections, and prerequisiteLink
 *          if course was not offered that term will return -1
 */
classObject = (arrayOfClasses) =>{
  for (let e of arrayOfClasses)
  {
    if(this.props.courseDetails.name[0] === e.name[0]){
      console.log(e);
     return e;
    }
  }
  return -1;
}
//___________________________________________________________________
/**
 * @param quarter(w,f,s), year(18,17...), code which is course code
 * @return embed HTML Tag contianing img src
 */
getGraph = (quarter,year,code) =>{
  const url_base = "https://summer18.herokuapp.com/";
  const graph_url = url_base + quarter+'/' + year + '/' + code;
  return fetch(graph_url).then((response) =>response.text());
}
//___________________________________________________
listOfCodes = (course) =>{
  const codeList = []
  course.sections.forEach( (section) =>{
    if(section.units !== '0')
    codeList.push(section.classCode)
  })
  return codeList; 
}
//___________________________________________________
  handleChange = (event, value) => {
  this.setState({ value, load:1});
  //fall
  if(value === 2){
    if(this.state.courseForTableFall.length===0)
    console.log(!this.state.courseForTableFall.length)
    this.askForCourseCode('2018 Fall').then(responses =>{
      if(responses !== -1){
        this.setState({courseForTableFall:responses})
        const codes = this.listOfCodes(responses)
        const gList =[]
        codes.forEach( (code) => {
        this.getGraph("f", "18", code).then((result)=>
       this.setState({graphFall:[...this.state.graphFall, result],load:0}));
      })
      }
      else
        this.setState({courseForTableFall:null,load:0})
    })
}
  // spring
  else if(value === 1){
    this.askForCourseCode('2018 Spring').then(responses =>{
      if(responses !== -1){
        this.setState({courseForTableSpring:responses})
        const codes = this.listOfCodes(responses)
        codes.forEach( (code) => {
        this.getGraph("s", "18", code).then((result)=>this.setState({graphSpring:[...this.state.graphSpring, result],load:0}));})
    }
    else
        this.setState({courseForTableSpring:null,load:0})
  })
}
  // winter
  else if(value === 0)
  {
    this.handleAction();
  }
}

/**
 * this will be called when the model open 
 */
handleAction = () =>{
  this.setState({load:1});
  this.askForCourseCode('2018 Winter').then(responses =>{
    if(responses !== -1){
      this.setState({courseForTableWinter:responses})
      const codes = this.listOfCodes(responses)
      codes.forEach( (code) => {
      this.getGraph("w", "18", code).then((result)=>this.setState({graphWinter:[...this.state.graphWinter, result],load:0}));})
  }
  else
  this.setState({courseForTableWinter:null,load:0})})
}
/**
 * reset the state for table and graphs
 */
 whatToRender = () => {
      const graphs = []
      if(this.state.value === 0)
      {
        this.state.graphWinter.forEach( (graphImg) => {
          graphs.push( <div style={getModalStyle()} dangerouslySetInnerHTML={{__html: graphImg}}/> );})
      }
      else if(this.state.value === 1)
      {
        this.state.graphSpring.forEach( (graphImg) => {
          graphs.push( <div style={getModalStyle()} dangerouslySetInnerHTML={{__html: graphImg}}/> );})
      }
      else{
        this.state.graphFall.forEach( (graphImg) => {
          graphs.push( <div style={getModalStyle()} dangerouslySetInnerHTML={{__html: graphImg}}/> );})
      }
    return graphs
 }
 
table = () =>{
let all = []
let table = []
if(this.state.value === 0)
  table = this.state.courseForTableWinter
else if(this.state.value === 1)
  table = this.state.courseForTableSpring
else
  table = this.state.courseForTableFall
console.log(table)
  if(table !== null && table.length !==0){
    table.sections.forEach( (classInfo) =>{
      if(classInfo.units !== '0')
        all.push( <Table info={classInfo}/>); })
   }
   else if (table === null) {
     all.push( 
       <React.Fragment>
     <DialogTitle id="scroll-dialog-title">OPS!</DialogTitle>
     <DialogContent>
       <DialogContentText>
         This Class was not offered that term! Ask UCI office of reserch why at: IRB@research.uci.edu
       </DialogContentText>
     </DialogContent>
     <DialogActions>
      
     </DialogActions>
     </React.Fragment>);
   }
   else if(!table.length){
     all.push(<div/>)
   }
   return all
 }


showMe = () => {
  if (this.state.load === 1) {
    return( <div style={{height: '100%', width: '100%', display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'}}><CircularProgress size={50}/></div>)
      }
  else{    
 const imgs = this.whatToRender()
 const talbes = this.table();
 const mix = []
 for(let i = 0; i < talbes.length; i++)
  {
    mix.push(talbes[i]);
    mix.push(imgs[i]);
  }
 return mix
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
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}>
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Winter 18" />
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
        {this.showMe()}
      </div>
        )
  }
}
CustomizedTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(CustomizedTabs);