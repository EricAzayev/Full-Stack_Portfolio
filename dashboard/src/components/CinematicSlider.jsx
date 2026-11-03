import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ExternalLink, Github } from 'lucide-react';

const CinematicSlider = ({ starProjects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shotIndex, setShotIndex] = useState(0);

  // Auto-advance every 12 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % starProjects.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [starProjects.length, isPaused]);

  const currentProject = starProjects[currentIndex];
  const shots = currentProject.screenshots || [currentProject.thumbnail];

  // Cycle the real app screenshots on the active slide (pauses on hover)
  useEffect(() => {
    setShotIndex(0);
  }, [currentIndex]);

  useEffect(() => {
    if (shots.length < 2 || isPaused) return;
    const timer = setInterval(() => setShotIndex((i) => (i + 1) % shots.length), 3500);
    return () => clearInterval(timer);
  }, [shots.length, isPaused]);

  // Mouse position for subtle parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [3, -3]);
  const rotateY = useTransform(mouseX, [-300, 300], [-3, 3]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  return (
    <section className="cinematic-slider">
      <div className="slider-container">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="slide-wrapper"
          >
            <div className="slide-content">
              {/* LEFT: real application screenshots */}
              <motion.div
                className="video-container"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                  perspective: 1000
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${currentProject.id}-${shotIndex}`}
                    src={shots[shotIndex]}
                    alt={`${currentProject.name} screenshot`}
                    className="demo-shot"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55 }}
                  />
                </AnimatePresence>

                {/* Geist Subtle Border Glow */}
                <div className="video-border-glow" />

                {/* Gradient Overlay on Bottom */}
                <div className="video-gradient-overlay" />
              </motion.div>

              {/* RIGHT: Technical Narrative */}
              <motion.div
                className="narrative-panel"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.h2
                  className="project-title-cinematic"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentProject.name}
                </motion.h2>

                <div className="title-underline" />

                <div className="challenge-block">
                  <span className="challenge-label">TECHNICAL CHALLENGE</span>
                  <p className="challenge-text">
                    {currentProject.keyChallenge}
                  </p>
                </div>

                {/* Tech Stack Icons */}
                <div className="tech-icons-cinematic">
                  <span className="tech-label">STACK</span>
                  <div className="icons-row">
                    {currentProject.techStack.map((tech, i) => (
                      <motion.div
                        key={tech.name}
                        className="tech-icon-wrapper"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <img src={tech.icon} alt={tech.name} />
                        <span className="tech-name">{tech.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="cinematic-actions">
                  <motion.button
                    className="btn-cinematic btn-primary"
                    onClick={() => window.open(currentProject.demoUrl, '_blank')}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(129, 140, 248, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>OPEN DEMO</span>
                    <ExternalLink size={18} />
                  </motion.button>

                  <motion.button
                    className="btn-cinematic btn-secondary"
                    onClick={() => currentProject.codeUrl && window.open(currentProject.codeUrl, '_blank')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github size={18} />
                    VIEW CODE
                  </motion.button>
                </div>

                {/* Real, measured code size */}
                {currentProject.lines && (
                  <div className="stats-bar">
                    <div className="stat">
                      <span className="stat-value">{currentProject.lines.toLocaleString()}</span>
                      <span className="stat-label">Lines of code</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat">
                      <span className="stat-value">{currentProject.techStack.length}</span>
                      <span className="stat-label">Technologies</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button
          className="nav-arrow nav-prev"
          onClick={() => {
            setDirection(-1);
            setCurrentIndex((prev) => (prev - 1 + starProjects.length) % starProjects.length);
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Previous project"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <button
          className="nav-arrow nav-next"
          onClick={() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % starProjects.length);
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Next project"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </button>

        {/* Pagination Dots */}
        <div className="pagination-dots">
          {starProjects.map((_, i) => (
            <motion.button
              key={i}
              className={`dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CinematicSlider;