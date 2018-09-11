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
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 600,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

let id = 0;
function createData(Code, Type, Units, Instructors, Time) {
  id += 1;
  return { id, Code, Type, Units, Instructors, Time };
}

/*const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];*/

function CustomizedTable(props) {
  const { classes } = props;
  const info = props.info
    //console.log(info);
  const rows = [
    createData(info.classCode, info.classType +" "+info.sectionCode , info.units, info.instructors[0], info.meetings[0])
  ];

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <CustomTableCell>Code</CustomTableCell>
            <CustomTableCell numeric>Type</CustomTableCell>
            <CustomTableCell numeric>Units (g)</CustomTableCell>
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