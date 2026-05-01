import React from 'react';
import { Facebook, Instagram, Github, Mail, Heart, HandCoins } from 'lucide-react';
import logoText from '../../assets/images/logo_text.png';

const Footer: React.FC = () => {
  const socialLinks = [
    { href: "https://www.facebook.com/ctrlkd1", icon: Facebook, label: "Facebook" },
    { href: "https://www.instagram.com/trcongminh_04/", icon: Instagram, label: "Instagram" },
    { href: "https://github.com/dexter826", icon: Github, label: "GitHub" },
    { href: "mailto:tcongminh1604@gmail.com", icon: Mail, label: "Email" }
  ];

  return (
    <footer className="hidden md:block relative bg-surface border-t border-border-default py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Khối 1: Thương hiệu */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img src={logoText} alt="CineMOB" className="h-7 select-none" />
          </div>
          <p className="text-xs text-text-muted mt-1.5 flex items-center justify-center md:justify-start gap-1">
            Cine Over B**ch
            <HandCoins className="w-3 h-3 text-primary" />
          </p>
        </div>

        {/* Khối 2: Mạng xã hội */}
        <div className="flex-1 flex items-center justify-center gap-5">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-primary transition-colors duration-200"
                aria-label={link.label}
              >
                <Icon size={20} strokeWidth={1.5} />
              </a>
            );
          })}
        </div>

        {/* Khối 3: Bản quyền */}
        <div className="flex-1 text-xs text-text-muted flex items-center justify-center md:justify-end gap-1">
          <span>© {new Date().getFullYear()}</span>
          <span>• Made with</span>
          <Heart className="w-3 h-3 text-primary inline-block animate-pulse" />
          <span>by</span>
          <a
            href="https://github.com/dexter826"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            MOB
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
