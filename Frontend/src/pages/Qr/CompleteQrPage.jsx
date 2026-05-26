import QrActionPage from "./QrActionPage";
import { useCompleteRegistrationByQrCode } from "../../hook/useRegistration";

export default function CompleteQrPage() {
  return (
    <QrActionPage
      mode="complete"
      title="Scan Checkout QR"
      subtitle="Confirm your volunteer event completion from the web."
      initialMessage="Point your camera at the checkout QR."
      processingMessage="Completing event..."
      successMessage="Event completed successfully."
      alreadyDoneMessage="This event was already completed."
      invalidMessage="This QR code is invalid."
      fallbackErrorMessage="Unable to complete this event."
      useMutationHook={useCompleteRegistrationByQrCode}
      resultCtaLabel="View activity"
      resultCtaPath="/dashboard/activity"
    />
  );
}
