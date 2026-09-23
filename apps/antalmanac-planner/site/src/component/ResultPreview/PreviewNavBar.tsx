import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const previewLinks = [
    { id: 'preview-details', label: 'Details', icon: <ArticleOutlinedIcon /> },
    { id: 'preview-grades', label: 'Grades', icon: <BarChartIcon /> },
    { id: 'preview-schedule', label: 'Schedule', icon: <CalendarTodayIcon /> },
    { id: 'preview-reviews', label: 'Reviews', icon: <RateReviewIcon /> },
];

const PreviewNavBar = () => {
    const [activeSection, setActiveSection] = useState(previewLinks[0].id);
    const targetedSectionRef = useRef<string | null>(null);
    const scrollFallbackRef = useRef<number | null>(null);

    useEffect(() => {
        const scrollContainer = document.querySelector('.result-preview > div:last-child');
        if (!scrollContainer) return;

        const updateActiveSection = () => {
            if (targetedSectionRef.current) return;

            const containerTop = scrollContainer.getBoundingClientRect().top;
            let currentSection = previewLinks[0];

            for (let i = previewLinks.length - 1; i >= 0; i--) {
                const section = document.getElementById(previewLinks[i].id);
                if (section && section.getBoundingClientRect().top <= containerTop + 40) {
                    currentSection = previewLinks[i];
                    break;
                }
            }

            setActiveSection(currentSection.id);
        };

        const commitTargetedSection = () => {
            if (!targetedSectionRef.current) return;

            setActiveSection(targetedSectionRef.current);
            targetedSectionRef.current = null;
        };

        updateActiveSection();
        scrollContainer.addEventListener('scroll', updateActiveSection);
        scrollContainer.addEventListener('scrollend', commitTargetedSection);

        return () => {
            scrollContainer.removeEventListener('scroll', updateActiveSection);
            scrollContainer.removeEventListener('scrollend', commitTargetedSection);
        };
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        targetedSectionRef.current = id;

        if (scrollFallbackRef.current) {
            window.clearTimeout(scrollFallbackRef.current);
        }

        scrollFallbackRef.current = window.setTimeout(() => {
            targetedSectionRef.current = null;
            scrollFallbackRef.current = null;
        }, 800);

        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav className="preview-nav-bar" aria-label="Preview sections">
            {previewLinks.map((link) => (
                <Button
                    className={`preview-nav-button ${activeSection === link.id ? 'active' : ''}`}
                    color="inherit"
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    size="small"
                    startIcon={link.icon}
                    variant="contained"
                    disableRipple={true}
                >
                    <span>{link.label}</span>
                </Button>
            ))}
        </nav>
    );
};

export default PreviewNavBar;
