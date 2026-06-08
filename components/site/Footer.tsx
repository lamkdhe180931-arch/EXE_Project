export function Footer() {
  return (
    <footer id="footer-sec" className="bg-dark-section">
      <div className="footer-hero" data-reveal>
        <h2 className="footer-big-text" id="footer-big-heading">
          <a href="mailto:contact@artdict.studio">
            <span className="footer-line">Contact</span>
            <span className="footer-line">
              Us <span className="footer-arrow-inline">↗</span>
            </span>
          </a>
        </h2>
      </div>
      <div className="footer-bottom-bar">
        <div className="footer-bottom-left">
          <span className="footer-logo-text">ARTDICT</span>
          <span className="footer-copyright">— ©2026</span>
        </div>
        <div className="footer-bottom-right">
          <a href="#" id="social-instagram" className="footer-social-link">
            Instagram↗
          </a>
          <a href="#" id="social-behance" className="footer-social-link">
            Behance↗
          </a>
        </div>
      </div>
    </footer>
  );
}
