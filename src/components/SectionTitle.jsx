function SectionTitle({ title, description }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default SectionTitle;
