import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: "#b78727",//theme.palette.common.black,
    color: theme.palette.common.white,
    width:100,
    height:'60%',
    fontSize: 20,
    
  },
  body: {
    height:'60%',
    fontSize: 20,
  },
}))(TableCell);

const styles = theme => ({
  root: {
    width: '80%',
    marginTop: theme.spacing.unit*3 ,
    marginBottom: theme.spacing.unit*3 ,
    overflowX: 'auto',
    margin: "0 auto"
  },
  table: {
    minWidth: 100,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  width:100
});

let id = 0;
function createData(Code, Type, Units, Instructors, Time) {
  id += 1;
  return { id, Code, Type, Units, Instructors, Time };
}

function CustomizedTable(props) {
  const { classes } = props;
  const info = props.info
    //console.log(info);
  const rows = [
    createData(info.classCode, info.classType +" "+info.sectionCode , info.units, info.instructors[0], info.meetings[0][0])
  ];

  return (
    <Paper className={classes.root}>
      <Table className={classes.table} padding='none'>
        <TableHead  style={{height: 1}}>
          <TableRow>
            <CustomTableCell>Code</CustomTableCell>
            <CustomTableCell numeric>Type</CustomTableCell>
            <CustomTableCell numeric>Units</CustomTableCell>
            <CustomTableCell numeric>Instructors</CustomTableCell>
            <CustomTableCell numeric>Time</CustomTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => {
            return (
              <TableRow className={classes.row} key={row.id}>
                <CustomTableCell component="th" scope="row">
                  {row.Code}
                </CustomTableCell>
                <CustomTableCell numeric>{row.Type}</CustomTableCell>
                <CustomTableCell numeric>{row.Units}</CustomTableCell>
                <CustomTableCell numeric>{row.Instructors}</CustomTableCell>
                <CustomTableCell numeric>{row.Time}</CustomTableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

CustomizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomizedTable);
