import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
      <h1 className="text-2xl font-semibold">Website Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Logo URL</label>
          <Input placeholder="https://..." />
        </div>
        <div>
          <label className="text-sm font-medium">Primary color</label>
          <Input type="color" defaultValue="#1c1b1f" />
        </div>
        <div>
          <label className="text-sm font-medium">Instagram</label>
          <Input defaultValue="https://instagram.com/ceylara" />
        </div>
        <div>
          <label className="text-sm font-medium">Pinterest</label>
          <Input defaultValue="https://pinterest.com/ceylara" />
        </div>
      </div>
      <Button className="w-max">Save settings</Button>
    </div>
  );
}

