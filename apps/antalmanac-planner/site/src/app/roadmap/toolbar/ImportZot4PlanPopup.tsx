'use client';
import { FC, useState } from 'react';
import './ImportZot4PlanPopup.scss';
import {
  setPlanIndex,
  selectAllPlans,
  getNextPlannerTempId,
  setToastMsg,
  setToastSeverity,
  setShowToast,
} from '../../../store/slices/roadmapSlice.ts';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import trpc from '../../../trpc.ts';
import { expandAllPlanners, makeUniquePlanName } from '../../../helpers/planner.ts';
import { markTransfersAsUnread } from '../../../helpers/transferCredits.ts';
import helpImage from '../../../asset/zot4plan-import-help.png';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn.ts';
import { useTransferredCredits } from '../../../hooks/transferCredits.ts';
import { setUserAPExams } from '../../../store/slices/transferCreditsSlice.ts';
import Image from 'next/image';

import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { addPlanner } from '../../../helpers/roadmapEdits.ts';
import { useReviseAndSaveRoadmap } from '../../../hooks/planner.ts';

const ImportZot4PlanPopup: FC = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();
  const [showModal, setShowModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [studentYear, setStudentYear] = useState('1');
  const [busy, setBusy] = useState(false);
  const allPlanData = useAppSelector(selectAllPlans);
  const apExams = useTransferredCredits().ap;
  const nextPlanTempId = useAppSelector(getNextPlannerTempId);
  const reviseAndSaveRoadmap = useReviseAndSaveRoadmap();

  const obtainImportedRoadmap = async (schedName: string, currYear: string) => {
    // Get the result
    try {
      const { savedRoadmap, apExams: z4pApExams } = await trpc.zot4PlanImport.getScheduleFormatted.query({
        scheduleName: schedName,
        studentYear: currYear,
        temporaryId: nextPlanTempId,
      });

      // Combine added AP exams with AP exams from Zot4Plan; ignore any exams that were already added
      const newExams = z4pApExams.filter(
        (imported) => !apExams.some((existing) => existing.examName === imported.examName),
      );

      const newExamsUnread = markTransfersAsUnread(newExams);

      const combinedExams = apExams.concat(newExamsUnread);
      dispatch(setUserAPExams(combinedExams));

      // Add new AP exam rows
      if (isLoggedIn) {
        await trpc.transferCredits.overrideAllTransfers.mutate({
          courses: [],
          ap: combinedExams,
          ge: [],
          other: [],
        });
      }

      // Expand the result
      const expandedPlanners = await expandAllPlanners(savedRoadmap.planners);
      // Check for validity: length and invalid course names
      if (expandedPlanners.length < 1) {
        dispatch(setToastMsg('The schedule "' + schedName + '" could not be imported'));
        dispatch(setToastSeverity('error'));
        dispatch(setShowToast(true));
        return;
      }
      // Unknown (undefined) course names will crash PeterPortal if loaded, so remove them
      let problemCount = 0;
      for (const yearPlan of expandedPlanners[0].content.yearPlans) {
        for (const quarter of yearPlan.quarters) {
          const newCourses = quarter.courses.filter((course) => course != undefined);
          problemCount += quarter.courses.length - newCourses.length;
          quarter.courses = newCourses;
        }
      }
      if (problemCount > 0) {
        dispatch(setToastMsg('Partially imported "' + schedName + '" (removed ' + problemCount + ' unknown course(s)'));
        dispatch(setToastSeverity('error'));
        dispatch(setShowToast(true));
      }
      expandedPlanners[0].name = makeUniquePlanName(expandedPlanners[0].name, allPlanData);
      const revision = addPlanner(nextPlanTempId, expandedPlanners[0].name, expandedPlanners[0].content.yearPlans);
      reviseAndSaveRoadmap(revision);
      dispatch(setPlanIndex(allPlanData.length));
    } catch (err) {
      // Notify the user
      dispatch(setToastMsg('The schedule "' + schedName + '" could not be retrieved'));
      dispatch(setToastSeverity('error'));
      dispatch(setShowToast(true));
    }
  };

  const handleImport = async () => {
    setBusy(true);
    try {
      // Use the backend route to try to obtain the formatted schedule
      await obtainImportedRoadmap(scheduleName, studentYear);
      setShowModal(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Import Schedule from Zot4Plan</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate>
            <FormControl>
              <p>
                To add your{' '}
                <a target="_blank" href="https://zot4plan.com/" rel="noreferrer">
                  Zot4Plan
                </a>{' '}
                classes into a new roadmap, enter the exact name that you used to save your Zot4Plan schedule (as shown
                below).
              </p>
              <Image
                src={helpImage.src}
                width={helpImage.width}
                height={helpImage.height}
                alt="Screenshot of Zot4Plan's save feature where the schedule name is typically used"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Schedule Name</FormLabel>
              <TextField
                variant="outlined"
                type="text"
                placeholder="Exact Zot4Plan schedule name"
                onChange={(e) => setScheduleName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  // prevent submitting form (reloads the page)
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </FormControl>

            {scheduleName.length > 0 && scheduleName.length < 8 && (
              <span className="import-schedule-warning">
                <WarningAmberIcon className="import-schedule-icon" />
                No Zot4Plan schedule name contains less than 8 characters
              </span>
            )}

            <FormControl>
              <FormLabel>I am currently a...</FormLabel>
              <Select onChange={(ev) => setStudentYear(ev.target.value)} value={studentYear}>
                <MenuItem value="1">1st year</MenuItem>
                <MenuItem value="2">2nd year</MenuItem>
                <MenuItem value="3">3rd year</MenuItem>
                <MenuItem value="4">4th year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="inherit" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button disabled={scheduleName.length < 8} loading={busy} onClick={handleImport}>
            Import and Save
          </Button>
        </DialogActions>
      </Dialog>
      <Button variant="text" onClick={() => setShowModal(true)}>
        <CloudDownloadIcon />
        <span>Zot4Plan Schedule</span>
      </Button>
    </>
  );
};

export default ImportZot4PlanPopup;
