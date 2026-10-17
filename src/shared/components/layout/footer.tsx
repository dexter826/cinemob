import { Facebook, Instagram, Github, Mail } from 'lucide-react';

function Footer() {
  const socialLinks = [
    { href: 'https://www.facebook.com/ctrlkd1', icon: Facebook, label: 'Facebook' },
    { href: 'https://www.instagram.com/trcongminh_04/', icon: Instagram, label: 'Instagram' },
    { href: 'https://github.com/dexter826', icon: Github, label: 'GitHub' },
    { href: 'mailto:tcongminh1604@gmail.com', icon: Mail, label: 'Email' },
  ];

  return (
    <footer className="hidden md:block relative bg-background border-t border-border py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Khối 1: Thương hiệu */}
        <div className="flex-1 text-center md:text-left">
          <span className="font-display text-lg tracking-wide select-none">
            Cine<span className="text-primary">MOB</span>
          </span>
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
                className="text-text-secondary hover:text-primary transition-colors duration-200"
                aria-label={link.label}
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              </a>
            );
          })}
        </div>

        {/* Khối 3: Bản quyền */}
        <div className="flex-1 text-[10px] font-medium tracking-[0.1em] text-text-secondary flex items-center justify-center md:justify-end">
          <span>© {new Date().getFullYear()} CineMOB</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
