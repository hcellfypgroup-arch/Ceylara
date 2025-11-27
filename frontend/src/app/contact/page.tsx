import { ContentWrapper } from "@/components/content/content-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <ContentWrapper
      title="Contact Us"
      description="We respond to styling, order, wholesale, and press queries within 24 hours."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p>Email: care@ceylara.com</p>
          <p>Phone / WhatsApp: +91 98202 12345</p>
          <p>Studio: Lower Parel, Mumbai</p>
          <p>Support hours: Mon–Sat, 10am–7pm IST</p>
        </div>
        <form className="space-y-3">
          <Input placeholder="Your name" required />
          <Input placeholder="Email" type="email" required />
          <Textarea placeholder="How can we help?" rows={4} required />
          <Button type="submit">Send message</Button>
        </form>
      </div>
    </ContentWrapper>
  );
}

