import { motion } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';

const GridProjectCard = ({ project }) => {
  return (
    <motion.div
      className="grid-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Thumbnail */}
      <div className="card-thumbnail">
        <div className="thumbnail-image">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt={project.name} loading="lazy" />
          ) : (
            <div className="thumbnail-placeholder">
              <span className="thumbnail-emoji">{project.thumbnailEmoji || '💻'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card-body">
        <div className="card-header-grid">
          <h3 className="card-title-grid">{project.name}</h3>
          <span className="category-pill">{project.category}</span>
        </div>

        <p className="card-description-grid">{project.description}</p>

        {/* Tech Pills - Compact */}
        <div className="tech-pills-compact">
          {project.techStack.slice(0, 3).map(tech => (
            <span key={tech} className="tech-pill-mini">{tech}</span>
          ))}
          {project.techStack.length > 3 && (
            <span className="tech-pill-mini pill-more">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Action Row */}
        <div className="card-actions-grid">
          <motion.button
            className="btn-grid btn-demo"
            disabled={!project.demoUrl}
            onClick={() => project.demoUrl && window.open(project.demoUrl, '_blank')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink size={14} />
            Demo
          </motion.button>

          <motion.button
            className="btn-grid btn-code"
            onClick={() => project.codeUrl && window.open(project.codeUrl, '_blank')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github size={14} />
            Code
          </motion.button>
        </div>
      </div>

      {/* Geist Border Effect */}
      <div className="card-border-effect" />
    </motion.div>
  );
};

const GridSection = ({ projects }) => {
  return (
    <section className="grid-section">
      <div className="grid-header">
        <h2 className="grid-section-title">More Projects</h2>
        <div className="grid-subtitle">
          Frontend labs and the UnEarthed series - screenshots captured from the running apps
        </div>
      </div>

      <motion.div
        className="projects-grid-geist"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <GridProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default GridSection;