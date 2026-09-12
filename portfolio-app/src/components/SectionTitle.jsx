function SectionTitle({ children, accent, index }) {
  return (
    <div className="section-title-wrap">
      {index && <span className="section-index">{index}</span>}
      <h2 className="heading">{children} {accent && <span>{accent}</span>}</h2>
    </div>
  );
}

export default SectionTitle;
