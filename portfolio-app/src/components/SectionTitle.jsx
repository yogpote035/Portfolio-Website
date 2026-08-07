function SectionTitle({ children, accent }) {
  return (
    <h2 className="heading">
      {children} {accent && <span>{accent}</span>}
    </h2>
  );
}

export default SectionTitle;
