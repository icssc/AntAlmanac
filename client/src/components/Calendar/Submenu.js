import React, { Fragment } from 'react';
import { Menu, MenuItem, MenuList, IconButton } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import CustomEventsDialog from '../CustomEvents/CustomEventDialog';
import FinalSwitch from './FinalSwitch';
import ClearSchedButton from './ClearScheduleDialog';
import {
    usePopupState,
    bindHover,
    bindTrigger,
    bindPopover,
    bindMenu,
} from 'material-ui-popup-state/hooks';

const Submenu = (props) => {
    const popupState = usePopupState({ variant: 'popover' });
    // const func = () => {
    //     const events = this.props.eventsInCalendar;
    //
    //     let result = [];
    //     let finalSchedule = [];
    //     for (let item of events)
    //         if (
    //             result.find(function(element) {
    //                 return element.courseCode === item.courseCode;
    //             }) === undefined
    //         )
    //             result.push(item);
    //
    //     for (let course of result) {
    //         if (course.section !== undefined) {
    //             let final = course.section.finalExam;
    //
    //             if (final.length > 5) {
    //                 let [, , , date, start, startMin, end, endMin, ampm] = final.match(
    //                     /([A-za-z]+) *(\d{1,2}) *([A-za-z]+) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/,
    //                 );
    //                 start = parseInt(start, 10);
    //                 startMin = parseInt(startMin, 10);
    //                 end = parseInt(end, 10);
    //                 endMin = parseInt(endMin, 10);
    //                 date = [
    //                     date.includes('M'),
    //                     date.includes('Tu'),
    //                     date.includes('W'),
    //                     date.includes('Th'),
    //                     date.includes('F'),
    //                 ];
    //                 if (ampm === 'p' && end !== 12) {
    //                     start += 12;
    //                     end += 12;
    //                     if (start > end) start -= 12;
    //                 }
    //
    //                 date.forEach((shouldBeInCal, index) => {
    //                     if (shouldBeInCal)
    //                         finalSchedule.push({
    //                             title: course.title,
    //                             courseType: 'Fin',
    //                             courseCode: course.courseCode,
    //                             location: course.location,
    //                             color: course.color,
    //                             start: new Date(2018, 0, index + 1, start, startMin),
    //                             end: new Date(2018, 0, index + 1, end, endMin),
    //                         });
    //                 });
    //             }
    //         }
    //     }
    // };

    return (
        <Fragment>
            <IconButton {...bindTrigger(popupState)}>
                <MoreVert fontSize="small" />
            </IconButton>
            <Menu
                {...bindMenu(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <MenuList>
                    <MenuItem disableGutters>
                        <CustomEventsDialog
                            editMode={false}
                            handleSubmenuClose={() => popupState.close()}
                        />
                    </MenuItem>
                    {/*<MenuItem>*/}
                    {/*    <FinalSwitch*/}
                    {/*        displayFinal={this.props.displayFinal}*/}
                    {/*        schedule={finalSchedule}*/}
                    {/*        showFinalSchedule={this.props.showFinalSchedule}*/}
                    {/*    />*/}
                    {/*</MenuItem>*/}
                    <MenuItem disableGutters>
                        <ClearSchedButton
                            handleSubmenuClose={() => popupState.close()}
                            currentScheduleIndex={props.currentScheduleIndex}
                        />
                    </MenuItem>
                </MenuList>
            </Menu>
        </Fragment>
    );
};

export default Submenu;
