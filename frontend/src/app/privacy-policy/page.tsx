import { ContentWrapper } from "@/components/content/content-wrapper";

export default function PrivacyPolicyPage() {
  return (
    <ContentWrapper title="Privacy Policy">
      <p>
        We collect personal data (name, email, address, phone) solely to fulfill orders,
        provide support, and personalize recommendations. Payment details are processed
        via PCI-compliant gateways and never stored on CEYLARA servers.
      </p>
      <p>
        Cookies help us remember your preferences, measure performance, and power smart
        search suggestions. You can opt out via browser controls. We never sell your data
        and only share it with logistics partners involved in your delivery.
      </p>
    </ContentWrapper>
  );
}

