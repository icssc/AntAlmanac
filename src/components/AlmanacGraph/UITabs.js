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
      width: "70%",
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
    graph:[],
    courseForTable:[]
  };
//_____________________________________
askForCourseCode = async(term) =>{
  this.setState({graph:[]})
  const params = {department: this.props.term.dept, term: term};
  const url = new URL("https://websocserver.herokuapp.com/");
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const res = await fetch(url).then((response) => response.json())
  const data = [...res[0].departments[0].courses]
  //console.log(data);
  return data;
}
//___________________________________________________
getGraph = (quarter,year,code,callback) =>{
  const url_base = "https://summer18.herokuapp.com/";
  const graph_url = url_base + quarter+'/' + year + '/' + code;
  return fetch(graph_url).then((response) =>response.text());
}
//___________________________________________________
  handleChange = (event, value) => {
  this.setState({ value, load:1});
  
  if(value === 2){
    this.setState({graph:[]})
    this.setState({courseForTable:this.props.courseDetails})
    this.props.code.forEach( (code) => {
      this.getGraph("f", "18", code).then((result)=>this.setState({graph:[...this.state.graph, result],load:0}));
    })
}
  else if(value === 1){
    this.askForCourseCode("2018 Spring").then(responses =>{
    const courseCode = this.extractCode(responses)
    if(courseCode.length)
      courseCode.forEach( (code) => {
        this.getGraph("s", "18",code).then((result)=>this.setState({graph:[...this.state.graph, result],load:0}));
    })
    else{
      this.setState({ load:0});
    }
    });
  }
  else if(value === 0)
  {
    this.handleAction();
  }
}

extractCode = (arrayOfClasses) =>{
  
  let codeList = []
  for (let e of arrayOfClasses)
  {
    if(this.props.courseDetails.name[0] === e.name[0]){
      console.log(e);
      this.setState({courseForTable:e})
      e.sections.forEach( (section) =>{
        if(section.units !== '0')
        codeList.push(section.classCode)
      })
      break;
    }
  }
  if(!codeList.length){
    console.log("this course was not offed that term")
    this.setState({courseForTable: null}) 
 
  }
  console.log(codeList)
  return codeList;
}

handleAction = () =>{
  
  this.setState({ load:1});
  this.askForCourseCode("2018 Winter").then(responses =>{
  const courseCode = this.extractCode(responses)
  if(courseCode.length)
     courseCode.forEach( (code) => {
        this.getGraph("w", "18",code).then((result)=>this.setState({graph:[...this.state.graph, result],load:0})); }) 
  else {
    this.setState({ load:0});
  }   
});  
   
}
 whatToRender = () => {
      const graphs = []
      if(this.state.graph !== null)
      {
        this.state.graph.forEach( (graphImg) => {
          graphs.push( <div style={getModalStyle()} dangerouslySetInnerHTML={{__html: graphImg}}/> );})
      }
    return graphs
 }
 
table = () =>{
let all = []
  if(this.state.courseForTable !== null && this.state.courseForTable.length !==0){
    this.state.courseForTable.sections.forEach( (classInfo) =>{
      if(classInfo.units !== '0')
        all.push( <Table info={classInfo}/>); })
   }
   else if (this.state.courseForTable === null) {
     all.push( 
       <React.Fragment>
     <DialogTitle id="scroll-dialog-title">OOPPSS!</DialogTitle>
     <DialogContent>
       <DialogContentText>
         This Class was not offered that term! Ask UCI office of reserch why at: IRB@research.uci.edu
       </DialogContentText>
     </DialogContent>
     <DialogActions>
      
     </DialogActions>
     </React.Fragment>);
   }
   else if(!this.state.courseForTable.length){
     all.push(<div/>)
   }
   return all
 }

/*showMe = () => {
  const graphAndInfo = []
  if(this.state.courseForTable !== null && this.state.courseForTable.length !==0)
   for(let i =0; i < this.state.courseForTable.sections.length;i++)
    {
    graphAndInfo.push(<Table info={this.state.courseForTable.sections[i]}/>);
    if(this.state.graph !== null)
    graphAndInfo.push(<div style={getModalStyle()} dangerouslySetInnerHTML={{__html: this.state.graph[i]}}/> )
    }
  console.log(graphAndInfo)
  return graphAndInfo;
}*/
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
//{this.table()}
//{this.whatToRender()}