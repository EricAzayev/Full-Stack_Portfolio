import React from 'react';
import { ExternalLink } from 'lucide-react';

const ProjectCard = ({ project, status }) => {
    const handleOpen = () => {
        window.open(`/projects/${project.id}/`, '_blank');
    };

    const isBuilt = status === 'available';

    return (
        <div className={`project-card ${project.highlight ? 'highlight' : ''}`}>
            <div className="card-content">
                <div className="card-header">
                    <div className="card-title-group">
                        <span className="thumbnail" role="img" aria-label="thumbnail">
                            {project.thumbnail || '💻'}
                        </span>
                        <div>
                            <h3 className="project-title">{project.name}</h3>
                            <span className="category-badge">{project.category}</span>
                        </div>
                    </div>
                </div>

                <p className="project-description">{project.description}</p>

                <div className="tech-stack">
                    {project.techStack.map(tech => (
                        <span key={tech} className="tech-pill">{tech}</span>
                    ))}
                </div>

                <div className="card-actions">
                    <div className="status-indicator">
                        <div className={`dot ${isBuilt ? 'running' : 'stopped'}`}></div>
                        <span>{isBuilt ? 'Built' : 'Not Built'}</span>
                    </div>

                    <button
                        onClick={handleOpen}
                        disabled={!isBuilt}
                        className="btn btn-open"
                        title={isBuilt ? 'Open project' : 'Project needs to be built first'}
                    >
                        <ExternalLink size={16} /> Open
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
