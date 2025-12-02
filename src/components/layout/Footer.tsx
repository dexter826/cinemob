import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, Github, Mail, Heart, Star, Film, Clapperboard, Popcorn, Sparkles, PartyPopper, Ticket, Video, Camera, Award } from 'lucide-react';
import logoText from '../../assets/images/logo_text.png';

// Icon pool for confetti burst
const confettiIcons = [Star, Film, Clapperboard, Popcorn, Sparkles, PartyPopper, Ticket, Video, Camera, Award, Heart];

interface ConfettiParticle {
  id: number;
  Icon: React.ElementType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300
    }
  }
};

const socialIconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 15,
      stiffness: 400
    }
  }
};

const Footer: React.FC = () => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const colors = [
    '#10b981', // primary green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#3b82f6', // blue
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnimating) return;

    // Generate 12-18 random particles
    const particleCount = Math.floor(Math.random() * 7) + 12;
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 60 + Math.random() * 80;
      const Icon = confettiIcons[Math.floor(Math.random() * confettiIcons.length)];
      
      newParticles.push({
        id: Date.now() + i,
        Icon,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotation: Math.random() * 720 - 360,
        scale: 0.5 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(newParticles);
    setIsAnimating(true);

    // Clear particles after animation
    setTimeout(() => {
      setParticles([]);
      setIsAnimating(false);
    }, 800);
  }, [isAnimating]);

  const socialLinks = [
    {
      href: "https://www.facebook.com/ctrlkd1",
      icon: Facebook,
      label: "Facebook"
    },
    {
      href: "https://www.instagram.com/trcongminh_04/",
      icon: Instagram,
      label: "Instagram"
    },
    {
      href: "https://github.com/dexter826",
      icon: Github,
      label: "GitHub"
    },
    {
      href: "mailto:tcongminh1604@gmail.com",
      icon: Mail,
      label: "Email"
    }
  ];

  return (
    <footer className="relative bg-surface border-t border-black/10 dark:border-white/10 py-8 mt-auto overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient-x opacity-50" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-2 h-2 bg-primary/20 rounded-full" 
          style={{ top: '20%', left: '10%' }}
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-1.5 h-1.5 bg-secondary/20 rounded-full" 
          style={{ top: '60%', left: '80%' }}
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-2.5 h-2.5 bg-primary/15 rounded-full" 
          style={{ top: '40%', left: '50%' }}
          animate={{ 
            y: [0, -10, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.55, 0.25]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="relative max-w-7xl mx-auto px-4 md:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand section */}
          <motion.div 
            className="flex-1 text-center md:text-left"
            variants={itemVariants}
          >
            <motion.div 
              className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer relative"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Logo with confetti container */}
              <div className="relative">
                {/* Confetti particles container */}
                <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
                  <AnimatePresence>
                    {particles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        className="absolute"
                        style={{ color: particle.color }}
                        initial={{ 
                          x: 0, 
                          y: 0, 
                          rotate: 0, 
                          scale: 0,
                          opacity: 1 
                        }}
                        animate={{ 
                          x: particle.x, 
                          y: particle.y, 
                          rotate: particle.rotation, 
                          scale: particle.scale,
                          opacity: 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 0.8, 
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      >
                        <particle.Icon size={16} strokeWidth={2} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.img
                  src={logoText}
                  alt="CineMOB"
                  className="h-8 select-none"
                  animate={isAnimating ? { scale: [1, 0.9, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  whileHover={{ 
                    filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))"
                  }}
                />
              </div>
            </motion.div>
            <motion.p 
              className="text-sm text-text-muted mt-1 flex items-center justify-center md:justify-start gap-1.5"
              variants={itemVariants}
            >
              Cine Over B**ch
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-3.5 h-3.5 text-primary inline-block" />
              </motion.span>
            </motion.p>
          </motion.div>

          {/* Social links with staggered animation */}
          <motion.div 
            className="flex-1 flex items-center justify-center gap-4"
            variants={containerVariants}
          >
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group relative text-text-muted"
                  aria-label={link.label}
                  variants={socialIconVariants}
                  whileHover={{ 
                    scale: 1.15, 
                    y: -3,
                    color: '#10b981'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow effect on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-primary/20 rounded-full blur-md scale-150"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />

                  <div className="relative">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>

                  {/* Tooltip */}
                  <motion.span 
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-black/10 dark:border-white/10 rounded text-xs text-text-main whitespace-nowrap pointer-events-none shadow-lg"
                    initial={{ opacity: 0, y: 5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                  >
                    {link.label}
                  </motion.span>
                </motion.a>
              );
            })}
          </motion.div>

          {/* Copyright */}
          <motion.div 
            className="flex-1 text-sm text-text-muted flex items-center justify-center md:justify-end gap-1.5"
            variants={itemVariants}
          >
            <span>© {new Date().getFullYear()}</span>
            <span className="text-primary font-semibold">CineMOB</span>
            <span>• Made by</span>
            <motion.a
              href="https://github.com/dexter826"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              MOB
            </motion.a>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-x {
            animation: none;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
