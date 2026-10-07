import { GuidePage } from "@/components/help/guide-page";

export const metadata = { title: "Stream the funeral to family abroad — AfterCare UK" };

export default function StreamingPage() {
  return (
    <GuidePage
      title="Let family far away join the funeral"
      intro="When relatives are abroad — in Nigeria, Jamaica, India or anywhere else — they can still watch live and say goodbye."
      steps={[
        {
          title: "Ask the crematorium or place of worship first",
          body: "Many UK crematoria and churches already have cameras and offer a live webcast and a recording for a small fee. Ask your funeral director to book it when you book the service.",
        },
        {
          title: "Or stream it yourselves",
          body: (
            <>
              Ask one person to hold a phone on a small tripod near the front. For a few people, a{" "}
              <strong>WhatsApp video call</strong> is easiest. For many, use <strong>Zoom</strong> or an unlisted{" "}
              <strong>YouTube Live</strong> stream. Check with the venue that filming is allowed.
            </>
          ),
        },
        {
          title: "Test the signal beforehand",
          body: "Visit the venue or arrive early and check mobile data or Wi-Fi. Bring a charger or power bank.",
        },
        {
          title: "Get the time right",
          body: "Send the start time in both countries. Nigeria is on the same time as the UK in summer and one hour ahead in winter.",
        },
        {
          title: "Share one simple link",
          body: "Send the link in the family WhatsApp group the day before, and name one person abroad to help others join. Share the order of service as a photo or PDF.",
        },
        {
          title: "Record it for people who can't watch live",
          body: "Save a copy of the stream or ask the venue for the recording. Some families also hold a second gathering back home.",
        },
      ]}
      footnote="AfterCare isn't paid by any company or app we mention."
    />
  );
}
