const FormLayout = ({
  title,
  description,
  onSubmit,
  className = "",
  children,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-6 rounded-2xl bg-pale-canvas p-6 font-clash-grotesk text-deep-forest sm:p-8 md:p-10"
      >
        <div className="space-y-3">
          <p className="font-beni text-5xl uppercase text-foudre-pink sm:text-6xl md:text-7xl leading-[0.7]">
            {title}
          </p>
          {description && (
            <p className="max-w-2xl text-sm font-medium leading-[1.2] text-deep-forest/75 sm:text-base">
              {description}
            </p>
          )}
        </div>
        {children}
      </form>
    </div>
  );
};
export default FormLayout;
