/** Filet doré à losange central — le séparateur récurrent de l'identité. */
export default function Rule({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/45" />
      <span className="h-1 w-1 rotate-45 bg-gold/70" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/45" />
    </div>
  );
}
