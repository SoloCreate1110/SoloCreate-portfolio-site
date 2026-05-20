interface SectionHeaderProps {
  title: string;
  number: string;
  className?: string;
}

export default function SectionHeader({ title, number, className = '' }: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`}>
      <h2 
        className="section-title"
        style={{ fontFamily: "'Archivo Black', sans-serif" }}
      >
        {title}
      </h2>
      <span className="section-number">{number}</span>
    </div>
  );
}
