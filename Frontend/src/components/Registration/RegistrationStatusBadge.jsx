export default function RegistrationStatusBadge({ status }) {
  const map = {
    PENDING: "border border-foudre-pink/20 bg-ash-whisper text-foudre-pink",
    APPROVED: "border border-deep-forest/15 bg-deep-forest/10 text-deep-forest",
    REJECTED: "border border-foudre-pink/20 bg-foudre-pink/10 text-foudre-pink",
    COMPLETED: "border border-deep-forest/15 bg-deep-forest/10 text-deep-forest",
  };

  return (
    <span
      className={`inline-flex items-center rounded-[10px] px-3 py-1 text-sm font-bold leading-[1.2] ${map[status]}`}
    >
      {status === "PENDING" && "Pending"}
      {status === "APPROVED" && "Accept"}
      {status === "REJECTED" && "Reject"}
      {status === "COMPLETED" && "Completed"}
    </span>
  );
}
