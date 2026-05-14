import { useMagnetic } from '../../pages/Landing/hooks/useMagnetic'

function MagneticButton({ children, className = '', href, type = 'button', onClick, ...props }) {
  const ref = useMagnetic()
  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      ref={ref}
      className={`magnetic-button ${className}`}
      href={href}
      type={href ? undefined : type}
      onClick={onClick}
      data-cursor="link"
      {...props}
    >
      <span>{children}</span>
    </Tag>
  )
}

export default MagneticButton
