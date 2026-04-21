import { useIsMobile } from '$hooks/useIsMobile';
import { useGradeExplorerStore, type ExplorerTab } from '$stores/GradeExplorerStore';
import { Close } from '@mui/icons-material';
import {
    Box,
    Dialog,
    DialogContent,
    Divider,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material';

import { BenchmarkPanel } from './BenchmarkPanel';
import { DetailsPanel } from './DetailsPanel';
import { DistributionPanel } from './DistributionPanel';
import { PresetsMenu } from './PresetsMenu';
import { QueryForm } from './QueryForm';
import { QueryStack } from './QueryStack';
import { TrendPanel } from './TrendPanel';
import { useGradeQueries } from './useGradeQueries';

export function GradeExplorerModal() {
    const isMobile = useIsMobile();
    const open = useGradeExplorerStore((s) => s.open);
    const closeModal = useGradeExplorerStore((s) => s.closeModal);
    const activeTab = useGradeExplorerStore((s) => s.activeTab);
    const setActiveTab = useGradeExplorerStore((s) => s.setActiveTab);
    const queries = useGradeExplorerStore((s) => s.queries);
    const activeQueryId = useGradeExplorerStore((s) => s.activeQueryId);
    const excludePNP = useGradeExplorerStore((s) => s.excludePNP);
    const excludeCOVID = useGradeExplorerStore((s) => s.excludeCOVID);
    const setExcludePNP = useGradeExplorerStore((s) => s.setExcludePNP);
    const setExcludeCOVID = useGradeExplorerStore((s) => s.setExcludeCOVID);

    const needsRaw = activeTab === 'details' || activeTab === 'trend';
    const results = useGradeQueries(queries, {
        includeRaw: needsRaw,
        excludePNP,
        excludeCOVID,
    });

    const activeQuery = queries.find((q) => q.id === activeQueryId);

    return (
        <Dialog
            open={open}
            onClose={closeModal}
            fullScreen={isMobile}
            maxWidth="xl"
            fullWidth
            PaperProps={{ sx: { height: isMobile ? '100%' : '90vh' } }}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="space-between"
                px={2}
                pt={1.5}
                spacing={1}
            >
                <Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Grade Explorer
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Compare grade distributions across instructors, quarters, and years.
                    </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap rowGap={0.5}>
                    <Tooltip title="Hide sections that only offered P/NP grading.">
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={excludePNP}
                                    onChange={(_e, checked) => setExcludePNP(checked)}
                                />
                            }
                            label={
                                <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                                    Exclude P/NP-only
                                </Typography>
                            }
                            sx={{ mx: 0 }}
                        />
                    </Tooltip>
                    <Tooltip title="Drop Winter 2020 through Summer 2021 from all charts and tables.">
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={excludeCOVID}
                                    onChange={(_e, checked) => setExcludeCOVID(checked)}
                                />
                            }
                            label={
                                <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                                    Exclude COVID
                                </Typography>
                            }
                            sx={{ mx: 0 }}
                        />
                    </Tooltip>
                    <PresetsMenu />
                    <IconButton onClick={closeModal} aria-label="Close grade explorer" size="small">
                        <Close />
                    </IconButton>
                </Stack>
            </Stack>

            <Box px={2} pt={1}>
                <QueryStack />
            </Box>

            <Box px={2} pt={2}>
                <QueryForm />
            </Box>

            <Tabs
                value={activeTab}
                onChange={(_e, value: ExplorerTab) => setActiveTab(value)}
                sx={{ px: 2, mt: 1, minHeight: 40 }}
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab label="Distribution" value="distribution" sx={{ minHeight: 40 }} />
                <Tab label="Trend" value="trend" sx={{ minHeight: 40 }} />
                <Tab label="Benchmark" value="benchmark" sx={{ minHeight: 40 }} />
                <Tab label="Details" value="details" sx={{ minHeight: 40 }} />
            </Tabs>
            <Divider />

            <DialogContent sx={{ flex: 1, overflow: 'auto', pt: 2 }}>
                {activeTab === 'distribution' && <DistributionPanel queries={queries} results={results} />}
                {activeTab === 'trend' && <TrendPanel queries={queries} results={results} />}
                {activeTab === 'benchmark' && (
                    <BenchmarkPanel
                        activeQuery={activeQuery}
                        activeResult={activeQuery ? results[activeQuery.id] : undefined}
                        excludePNP={excludePNP}
                        excludeCOVID={excludeCOVID}
                    />
                )}
                {activeTab === 'details' && <DetailsPanel queries={queries} results={results} />}
            </DialogContent>
        </Dialog>
    );
}
