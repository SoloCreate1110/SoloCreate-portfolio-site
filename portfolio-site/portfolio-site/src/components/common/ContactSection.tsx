import Link from 'next/link';

interface ContactLink {
  label: string;
  href: string;
  external?: boolean;
}

interface ContactSectionProps {
  title?: string;
  links?: ContactLink[];
}

const defaultLinks: ContactLink[] = [
  { label: 'Instagram', href: 'https://instagram.com', external: true },
  { label: 'X (Twitter)', href: 'https://x.com', external: true },
  { label: 'Email', href: 'mailto:hello@example.com', external: true },
];

export default function ContactSection({
  title = 'Get in Touch',
  links = defaultLinks,
}: ContactSectionProps) {
  return (
    <section className="border-4 border-black p-8 md:p-16 bg-amber-400 text-center">
      <h2
        className="text-4xl md:text-6xl lg:text-7xl uppercase mb-12"
        style={{ fontFamily: "'Archivo Black', sans-serif" }}
      >
        {title}
      </h2>

      <ul className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 flex-wrap">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutal"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="btn-brutal">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
