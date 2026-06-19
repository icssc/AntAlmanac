'use client';
import { FC, useCallback, useEffect, useState } from 'react';
import ReportGroup from './ReportGroup';
import ReviewItemGrid from '../../../component/ReviewItemGrid/ReviewItemGrid';
import trpc from '../../../trpc';
import { ReportGroupData } from '@peterportal/types';

const Reports: FC = () => {
  const [data, setData] = useState<ReportGroupData[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const getData = useCallback(async () => {
    const reports = await trpc.reports.get.query();

    const reportGroupMap: Record<string, ReportGroupData> = {};
    reports.forEach((report) => {
      reportGroupMap[report.reviewId] ??= { reviewId: report.reviewId, reports: [] };
      reportGroupMap[report.reviewId].reports.push(report);
    });
    const reportGroups = Object.values(reportGroupMap).sort((a, b) => b.reports.length - a.reports.length);

    setData(reportGroups);
    setReportsLoading(false);
  }, []);

  useEffect(() => {
    getData();
    document.title = 'View Reports | AntAlmanac Planner';
  }, [getData]);

  const acceptReports = async (reviewId: number) => {
    await trpc.reviews.delete.mutate({ id: reviewId });
    // reports are automatically deleted when deleting a review
    setData(data.filter((reportGroup) => reportGroup.reviewId !== reviewId));
  };

  const denyReports = async (reviewId: number) => {
    await trpc.reports.delete.mutate({ reviewId });
    setData(data.filter((reportGroup) => reportGroup.reviewId !== reviewId));
  };

  return (
    <ReviewItemGrid
      title="User Review Reports"
      description="Accepting a report will delete the review. Ignoring a report will preserve the review."
      isLoading={reportsLoading}
      noDataMsg="There are currently no reports that need attention."
    >
      {data.map((reportGroup) => (
        <ReportGroup
          key={`report-${reportGroup.reviewId}`}
          reportGroup={reportGroup}
          onAccept={() => acceptReports(reportGroup.reviewId)}
          onDeny={() => denyReports(reportGroup.reviewId)}
        />
      ))}
    </ReviewItemGrid>
  );
};

export default Reports;
