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
        className="flex flex-col gap-6 p-6 sm:p-8 md:p-10"
      >
        <div className="space-y-2">
          <p className="text-xl sm:text-2xl font-semibold text-gray-900">
            {title}
          </p>
          {description && (
            <p className="text-sm text-gray-500 leading-relaxed">
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
