import { colorForIndex, deriveQueryLabel, type GradeQuery, useGradeExplorerStore } from '$stores/GradeExplorerStore';
import { ContentCopy } from '@mui/icons-material';
import {
    Box,
    IconButton,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import type { RawGradeSection } from '@packages/antalmanac-types';
import { useMemo, useState } from 'react';

import type { QueryResults } from './useGradeQueries';

interface DetailsPanelProps {
    queries: GradeQuery[];
    results: QueryResults;
}

interface DetailsRow extends RawGradeSection {
    queryColor: string;
    queryLabel: string;
}

function rowAverageGPAString(row: RawGradeSection): string {
    return row.averageGPA != null ? row.averageGPA.toFixed(2) : 'n/a';
}

export function DetailsPanel({ queries, results }: DetailsPanelProps) {
    const addQuery = useGradeExplorerStore((s) => s.addQuery);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    const rows = useMemo<DetailsRow[]>(() => {
        const all: DetailsRow[] = [];
        for (const [idx, query] of queries.entries()) {
            const raw = results[query.id]?.raw ?? [];
            const color = colorForIndex(idx);
            const label = deriveQueryLabel(query);
            for (const row of raw) all.push({ ...row, queryColor: color, queryLabel: label });
        }
        all.sort((a, b) => {
            if (a.year !== b.year) return a.year > b.year ? -1 : 1;
            return a.quarter.localeCompare(b.quarter);
        });
        return all;
    }, [queries, results]);

    const anyLoading = queries.some((q) => results[q.id]?.loading);
    const totalRows = rows.length;

    const paginated = useMemo(() => rows.slice(page * pageSize, page * pageSize + pageSize), [rows, page, pageSize]);

    const handlePinSection = (row: RawGradeSection) => {
        addQuery({
            department: row.department,
            courseNumber: row.courseNumber,
            instructor: row.instructors[0],
            year: row.year,
            quarter: row.quarter,
            sectionCode: row.sectionCode,
            label: `${row.department} ${row.courseNumber} · ${row.quarter} ${row.year} · #${row.sectionCode}`,
        });
    };

    if (anyLoading && totalRows === 0) {
        return <Skeleton variant="rectangular" width="100%" height={360} />;
    }

    if (totalRows === 0) {
        return (
            <Stack alignItems="center" justifyContent="center" height={360} sx={{ color: 'text.secondary' }}>
                <Typography variant="body2">
                    No section rows yet. Narrow any query with at least one filter to see per-section detail.
                </Typography>
            </Stack>
        );
    }

    return (
        <Box>
            <TableContainer sx={{ maxHeight: 460 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 8, padding: 0 }} />
                            <TableCell>Term</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Instructor</TableCell>
                            <TableCell>Section</TableCell>
                            <TableCell align="right">Avg GPA</TableCell>
                            <TableCell align="right">A/B/C/D/F</TableCell>
                            <TableCell align="right">P/NP</TableCell>
                            <TableCell sx={{ width: 40 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginated.map((row) => (
                            <TableRow
                                key={`${row.sectionCode}-${row.year}-${row.quarter}`}
                                hover
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell sx={{ padding: 0, backgroundColor: row.queryColor }} />
                                <TableCell>
                                    <Typography variant="body2">
                                        {row.quarter} {row.year}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {row.department} {row.courseNumber}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{row.instructors.join(', ') || '—'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {row.sectionCode}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {rowAverageGPAString(row)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {row.gradeACount}/{row.gradeBCount}/{row.gradeCCount}/{row.gradeDCount}/
                                        {row.gradeFCount}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {row.gradePCount}/{row.gradeNPCount}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Pin this section as a new comparison query">
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => handlePinSection(row)}
                                                aria-label="Pin section as new query"
                                            >
                                                <ContentCopy fontSize="inherit" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalRows}
                page={page}
                onPageChange={(_e, nextPage) => setPage(nextPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
            />
        </Box>
    );
}
