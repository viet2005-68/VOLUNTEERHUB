const currentYear = new Date().getFullYear()

const navGroups = [
  {
    label: 'Platform',
    links: [
      { text: 'Browse Events', href: '#projects' },
      { text: 'Volunteer Teams', href: '#team' },
      { text: 'Organizations', href: '#agency' },
      { text: 'How It Works', href: '#manifesto' },
    ],
  },
  {
    label: 'Community',
    links: [
      { text: 'Join Now', href: '#contact' },
      { text: 'For Managers', href: '#services' },
      { text: 'FAQ', href: '#contact' },
      { text: 'Impact Stories', href: '#projects' },
    ],
  },
  {
    label: 'Connect',
    links: [
      { text: 'hello@volunteerhub.vn', href: 'mailto:hello@volunteerhub.vn' },
      { text: 'Facebook', href: '#' },
      { text: 'Instagram', href: '#' },
      { text: 'LinkedIn', href: '#' },
    ],
  },
]

function Footer() {
  return (
    <footer className="site-footer">
      {/* Top main section */}
      <div className="footer-main">
        <div className="footer-brand">
          <a href="#top" className="footer-logo" data-cursor="link">
            VolunteerHub
          </a>
          <p className="footer-tagline">
            A community platform for people and organizations<br />ready to turn care into action.
          </p>
          <a href="#contact" className="footer-cta" data-cursor="link">
            Start volunteering →
          </a>
        </div>

        <div className="footer-nav-groups">
          {navGroups.map(({ label, links }) => (
            <div key={label} className="footer-nav-group">
              <p className="footer-nav-label">{label}</p>
              <nav>
                {links.map(({ text, href }) => (
                  <a key={text} href={href} data-cursor="link">{text}</a>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {currentYear} VolunteerHub. All rights reserved.</span>
        <span className="footer-made">Made with ♥ for the community</span>
      </div>
    </footer>
  )
}

export default Footer
