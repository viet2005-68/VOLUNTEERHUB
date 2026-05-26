import QrActionPage from "./QrActionPage";
import { useJoinRegistrationByQrCode } from "../../hook/useRegistration";

export default function JoinQrPage() {
  return (
    <QrActionPage
      mode="join"
      title="Scan Event QR"
      subtitle="Join an event from your web browser."
      initialMessage="Point your camera at the event join QR."
      processingMessage="Joining event..."
      successMessage="Event joined successfully."
      alreadyDoneMessage="You already joined this event."
      invalidMessage="This QR code is invalid."
      fallbackErrorMessage="Unable to join this event."
      useMutationHook={useJoinRegistrationByQrCode}
      resultCtaLabel="View registrations"
      resultCtaPath="/dashboard/activity"
    />
  );
}
