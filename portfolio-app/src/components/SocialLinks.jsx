function SocialLinks({ socials }) {
  return (
    <div className="social-media" aria-label="Social profile links">
      {socials.map((social) => (
        <a
          aria-label={social.label}
          href={social.url}
          key={social.label}
          rel="noreferrer"
          target="_blank"
          title={social.label}
        >
          <i className={`bx ${social.icon}`} />
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
