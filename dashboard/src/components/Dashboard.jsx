import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from './ProjectCard';

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
        return <div className="global-loading">Loading Portfolio...</div>;
    }

    const getStatus = (id) => {
        const s = data.statuses.find(x => x.id === id);
        return s ? s.status : 'not-built';
    };

    return (
        <>
            <div className="dashboard-header">
                <h1>Codepath Full-Stack Portfolio</h1>
                <p>Showcase of projects from Codepath 102 & 103 coursework</p>
            </div>

            <div className="projects-grid">
                {data.projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        status={getStatus(project.id)}
                    />
                ))}
            </div>
        </>
    );
};

export default Dashboard;
