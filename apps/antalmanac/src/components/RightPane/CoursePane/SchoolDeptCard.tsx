import { ExpandMore } from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Grid,
    Paper,
    Typography,
} from "@mui/material";

interface SchoolDeptCardProps {
    comment: string;
    name: string;
    type: string;
}

export function SchoolDeptCard({ name, type, comment }: SchoolDeptCardProps) {
    const html = { __html: comment };

    return (
        <Grid size={{ xs: 12 }}>
            <Paper elevation={1} square style={{ overflow: "hidden" }}>
                <Accordion disableGutters>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                            paddingX: 1,
                            paddingY: 0,

                            /**
                             * AccordionSummary contains a child "content" which is the actual parent of the Typography below
                             * Styling to prevent wrap must be applied to the aforementioned parent
                             */
                            "& .MuiAccordionSummary-content": {
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            },
                        }}
                    >
                        <Typography
                            variant={type === "school" ? "h6" : "subtitle1"}
                            sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                        >
                            {name}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingX: 1, paddingY: 0 }}>
                        <Box sx={{ fontSize: 12 }}>
                            <Typography>
                                {comment === "" ? "No comments found" : "Comments:"}
                            </Typography>
                            <Box dangerouslySetInnerHTML={html} component="p" />
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Paper>
        </Grid>
    );
}
