export default function RegistrationStatusBadge({ status }) {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    COMPLETED: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 text-sm rounded-lg font-semibold ${map[status]}`}
    >
      {status === "PENDING" && "Pending"}
      {status === "APPROVED" && "Accept"}
      {status === "REJECTED" && "Reject"}
      {status === "COMPLETED" && "Completed"}
    </span>
  );
}
