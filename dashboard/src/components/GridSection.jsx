import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Github, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const VideoModal = ({ project, onClose }) => {
  return (
    <motion.div
      className="video-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="video-modal-content"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        {/* Video Player */}
        <video
          className="modal-video"
          autoPlay
          loop
          controls
          src={project.demoVideo}
        >
          <source src={project.demoVideo} type="video/mp4" />
        </video>
        
        {/* Modal Footer: Quick Info */}
        <div className="modal-footer">
          <div className="modal-project-info">
            <h4>{project.name}</h4>
            <p>{project.description}</p>
          </div>
          <div className="modal-actions">
            {project.demoUrl && (
              <a 
                href={project.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-modal"
              >
                OPEN LIVE DEMO
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const GridProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        className="grid-card"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Thumbnail with gradient overlay */}
        <div className="card-thumbnail">
          <div className="thumbnail-image">
            {project.thumbnail ? (
              <img src={project.thumbnail} alt={project.name} />
            ) : (
              <div className="thumbnail-placeholder">
                <span className="thumbnail-emoji">{project.thumbnailEmoji || '💻'}</span>
              </div>
            )}
          </div>
          
          {/* Gradient overlay that appears on hover */}
          <motion.div 
            className="thumbnail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            {project.demoVideo && (
              <motion.button
                className="play-button"
                onClick={() => setShowModal(true)}
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Play ${project.name} demo`}
              >
                <Play size={32} fill="#fff" />
              </motion.button>
            )}
          </motion.div>
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

      {/* MODAL: Video Theater */}
      <AnimatePresence>
        {showModal && (
          <VideoModal project={project} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

const GridSection = ({ projects }) => {
  return (
    <section className="grid-section">
      <div className="grid-header">
        <h2 className="grid-section-title">Additional Projects</h2>
        <div className="grid-subtitle">
          Exploration across Frontend, Full-Stack, and Game Logic
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
