function ImageReveal({ src, alt = '', className = '', caption, ...props }) {
  return (
    <figure className={`image-reveal ${className}`} data-animate="image-reveal" {...props}>
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export default ImageReveal
