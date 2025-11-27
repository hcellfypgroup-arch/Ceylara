import { ContentWrapper } from "@/components/content/content-wrapper";

export default function ReturnPolicyPage() {
  return (
    <ContentWrapper
      title="Return & Refund Policy"
      description="We offer easy returns within 10 days for unworn items with tags."
    >
      <ul>
        <li>Initiate a return request from your account or email care@ceylara.com.</li>
        <li>Items must be unused, with hangtags intact, and original packaging.</li>
        <li>Pickups are scheduled within 48 hours in metro cities.</li>
        <li>Refunds are processed within 5 working days after quality check.</li>
        <li>Final sale, lingerie, and altered pieces are non-returnable.</li>
      </ul>
    </ContentWrapper>
  );
}

