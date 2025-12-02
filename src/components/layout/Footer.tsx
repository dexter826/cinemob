import React, { useState, useCallback } from 'react';
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
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

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
      label: "Facebook",
      delay: "0ms"
    },
    {
      href: "https://www.instagram.com/trcongminh_04/",
      icon: Instagram,
      label: "Instagram",
      delay: "100ms"
    },
    {
      href: "https://github.com/dexter826",
      icon: Github,
      label: "GitHub",
      delay: "200ms"
    },
    {
      href: "mailto:tcongminh1604@gmail.com",
      icon: Mail,
      label: "Email",
      delay: "300ms"
    }
  ];

  return (
    <footer className="relative bg-surface border-t border-black/10 dark:border-white/10 py-8 mt-auto overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient-x opacity-50" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float-1" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-1.5 h-1.5 bg-secondary/20 rounded-full animate-float-2" style={{ top: '60%', left: '80%' }} />
        <div className="absolute w-2.5 h-2.5 bg-primary/15 rounded-full animate-float-3" style={{ top: '40%', left: '50%' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand section with fade-in animation */}
          <div className="flex-1 text-center md:text-left animate-fade-in-up">
            <div 
              className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer relative"
              onClick={handleLogoClick}
            >
              {/* Logo with confetti container */}
              <div className="relative">
                {/* Confetti particles container - positioned at center of logo */}
                <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
                  {particles.map((particle) => (
                    <div
                      key={particle.id}
                      className="absolute confetti-particle"
                      style={{
                        '--tx': `${particle.x}px`,
                        '--ty': `${particle.y}px`,
                        '--rotation': `${particle.rotation}deg`,
                        '--scale': particle.scale,
                        color: particle.color,
                      } as React.CSSProperties}
                    >
                      <particle.Icon size={16} strokeWidth={2} />
                    </div>
                  ))}
                </div>

                <img
                  src={logoText}
                  alt="CineMOB"
                  className={`h-8 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-105 select-none ${isAnimating ? 'animate-logo-pop' : ''}`}
                />
              </div>
            </div>
            <p className="text-sm text-text-muted mt-1 flex items-center justify-center md:justify-start gap-1.5">
              Cine Over B**ch
              <Heart className="w-3.5 h-3.5 text-primary animate-pulse-soft inline-block" />
            </p>
          </div>

          {/* Social links with staggered animation */}
          <div className="flex-1 flex items-center justify-center gap-4">
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group relative text-text-muted hover:text-primary transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: link.delay }}
                  aria-label={link.label}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150" />

                  <div className="relative transform group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>

                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface border border-black/10 dark:border-white/10 rounded text-xs text-text-main whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                    {link.label}
                  </span>
                </a>
              );
            })}
          </div>

          {/* Copyright with fade-in animation */}
          <div className="flex-1 text-sm text-text-muted animate-fade-in-up flex items-center justify-center md:justify-end gap-1.5" style={{ animationDelay: '400ms' }}>
            <span>© {new Date().getFullYear()}</span>
            <span className="text-primary font-semibold">CineMOB</span>
            <span>• Made by</span>
            <a
              href="https://github.com/dexter826"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium transition-colors"
            >
              MOB
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(10px, -20px) scale(1.2); opacity: 0.6; }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(-15px, 15px) scale(1.3); opacity: 0.5; }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50% { transform: translate(20px, -10px) scale(1.1); opacity: 0.55; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-float-1 {
          animation: float-1 8s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 10s ease-in-out infinite;
        }
        
        .animate-float-3 {
          animation: float-3 12s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes confetti-burst {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          20% {
            opacity: 1;
            transform: translate(calc(var(--tx) * 0.3), calc(var(--ty) * 0.3)) rotate(calc(var(--rotation) * 0.3)) scale(var(--scale));
          }
          100% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--rotation)) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes logo-pop {
          0% { transform: scale(1); }
          30% { transform: scale(0.9); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .confetti-particle {
          animation: confetti-burst 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-logo-pop {
          animation: logo-pop 0.4s ease-out;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-x,
          .animate-float-1,
          .animate-float-2,
          .animate-float-3,
          .animate-fade-in-up,
          .animate-pulse-soft,
          .confetti-particle,
          .animate-logo-pop {
            animation: none;
          }
          
          .group:hover > * {
            transform: none !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
