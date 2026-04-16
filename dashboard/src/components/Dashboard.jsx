import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CinematicSlider from './CinematicSlider';
import GridSection from './GridSection';
import { starProjects } from '../data/starProjects';

const Dashboard = () => {
    const [data, setData] = useState({ projects: [], statuses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get('/api/projects');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch projects', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="global-loading">
                <div className="loading-spinner"></div>
                <p>Loading Portfolio...</p>
            </div>
        );
    }

    // Filter out star projects from the grid
    const starProjectIds = starProjects.map(p => p.id);
    
    // Enhance grid projects with additional data
    const gridProjects = data.projects
        .filter(project => !starProjectIds.includes(project.id))
        .map(project => {
            const status = data.statuses.find(s => s.id === project.id);
            return {
                ...project,
                thumbnailEmoji: project.thumbnail,
                demoUrl: status?.status === 'available' ? `/projects/${project.id}/` : null,
                // Add demo video path if exists (placeholder for now)
                demoVideo: null // You can add video paths here later
            };
        });

    return (
        <>
            {/* Hero Section */}
            <header className="portfolio-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Systems & Solutions Engineer</h1>
                    <p className="hero-subtitle">
                        Full-Stack Portfolio — CodePath 102 & 103 Coursework
                    </p>
                </div>
            </header>

            {/* Cinematic Slider - Star Projects */}
            <CinematicSlider starProjects={starProjects} />

            {/* Grid Section - Additional Projects */}
            <GridSection projects={gridProjects} />
        </>
    );
};

export default Dashboard;
