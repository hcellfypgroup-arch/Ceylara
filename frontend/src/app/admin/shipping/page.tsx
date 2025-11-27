"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

type ShippingRate = {
  minWeight: number;
  maxWeight: number; // -1 represents Infinity
  fee: number;
};

type ShippingSettings = {
  rates: ShippingRate[];
  freeShippingThreshold: number;
  expressShippingSurcharge: number;
};

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings>({
    rates: [
      { minWeight: 0, maxWeight: 500, fee: 500 },
      { minWeight: 501, maxWeight: 1000, fee: 800 },
      { minWeight: 1001, maxWeight: 2000, fee: 1200 },
      { minWeight: 2001, maxWeight: 5000, fee: 2000 },
      { minWeight: 5001, maxWeight: -1, fee: 3000 },
    ],
    freeShippingThreshold: 15000,
    expressShippingSurcharge: 700,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/shipping");
      if (!response.ok) {
        throw new Error("Failed to fetch shipping settings");
      }

      const { data } = await response.json();
      if (data) {
        // Ensure rates array exists and has at least one rate
        const rates = data.rates && Array.isArray(data.rates) && data.rates.length > 0
          ? data.rates.map((rate: any) => ({
              ...rate,
              maxWeight: rate.maxWeight === -1 ? -1 : rate.maxWeight,
            }))
          : [
              { minWeight: 0, maxWeight: -1, fee: 500 },
            ];

        setSettings({
          rates,
          freeShippingThreshold: data.freeShippingThreshold || 15000,
          expressShippingSurcharge: data.expressShippingSurcharge || 700,
        });
      }
    } catch (error) {
      console.error("Failed to fetch shipping settings:", error);
      toast.error("Failed to load shipping settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        rates: settings.rates.map((rate) => ({
          minWeight: rate.minWeight,
          maxWeight: rate.maxWeight === -1 ? -1 : rate.maxWeight,
          fee: rate.fee,
        })),
        freeShippingThreshold: settings.freeShippingThreshold,
        expressShippingSurcharge: settings.expressShippingSurcharge,
      };

      const response = await fetch("/api/admin/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save shipping settings");
      }

      toast.success("Shipping settings saved successfully");
    } catch (error) {
      console.error("Failed to save shipping settings:", error);
      toast.error("Failed to save shipping settings");
    } finally {
      setSaving(false);
    }
  };

  const addRate = () => {
    // Ensure there's at least one rate to base the new rate on
    if (settings.rates.length === 0) {
      setSettings({
        ...settings,
        rates: [
          {
            minWeight: 0,
            maxWeight: -1,
            fee: 500,
          },
        ],
      });
      return;
    }

    const lastRate = settings.rates[settings.rates.length - 1];
    if (!lastRate) {
      toast.error("Unable to add rate. Please refresh the page.");
      return;
    }

    const newMinWeight = lastRate.maxWeight === -1 ? lastRate.minWeight + 1000 : lastRate.maxWeight + 1;
    setSettings({
      ...settings,
      rates: [
        ...settings.rates,
        {
          minWeight: newMinWeight,
          maxWeight: -1,
          fee: lastRate.fee + 500,
        },
      ],
    });
  };

  const removeRate = (index: number) => {
    if (settings.rates.length <= 1) {
      toast.error("At least one shipping rate is required");
      return;
    }
    setSettings({
      ...settings,
      rates: settings.rates.filter((_, i) => i !== index),
    });
  };

  const updateRate = (index: number, field: keyof ShippingRate, value: number) => {
    const newRates = [...settings.rates];
    newRates[index] = { ...newRates[index], [field]: value };
    setSettings({ ...settings, rates: newRates });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Shipping Fees Setup</h1>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">Loading shipping settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shipping Fees Setup</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Free Shipping Threshold */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Free Shipping</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Free Shipping Threshold (Rs)
              </label>
              <Input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                placeholder="15000"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                Orders above this amount will have free shipping
              </p>
            </div>
          </div>
        </div>

        {/* Express Shipping Surcharge */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Express Shipping</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Express Shipping Surcharge (Rs)
              </label>
              <Input
                type="number"
                value={settings.expressShippingSurcharge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    expressShippingSurcharge: Number(e.target.value),
                  })
                }
                placeholder="700"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                Additional fee added to standard shipping for express delivery
              </p>
            </div>
          </div>
        </div>

        {/* Weight-Based Shipping Rates */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Weight-Based Shipping Rates</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={addRate}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rate
            </Button>
          </div>
          <p className="text-sm text-[var(--muted)] mb-4">
            Configure shipping fees based on total order weight. Leave "Max Weight" empty or set to -1 for unlimited.
          </p>

          <div className="space-y-4">
            {settings.rates.map((rate, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-[var(--radius-md)]"
              >
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block text-[var(--muted)]">
                      Min Weight (grams)
                    </label>
                    <Input
                      type="number"
                      value={rate.minWeight}
                      onChange={(e) =>
                        updateRate(index, "minWeight", Number(e.target.value))
                      }
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-[var(--muted)]">
                      Max Weight (grams)
                    </label>
                    <Input
                      type="number"
                      value={rate.maxWeight === -1 ? "" : rate.maxWeight}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateRate(
                          index,
                          "maxWeight",
                          value === "" ? -1 : Number(value)
                        );
                      }}
                      placeholder="Unlimited"
                      min={rate.minWeight + 1}
                    />
                    {rate.maxWeight === -1 && (
                      <p className="text-xs text-[var(--muted)] mt-1">Unlimited</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-[var(--muted)]">
                      Shipping Fee (Rs)
                    </label>
                    <Input
                      type="number"
                      value={rate.fee}
                      onChange={(e) =>
                        updateRate(index, "fee", Number(e.target.value))
                      }
                      min={0}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRate(index)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-[var(--accent)] rounded-[var(--radius-md)]">
            <h3 className="text-sm font-semibold mb-2">Rate Preview</h3>
            <div className="space-y-2 text-sm">
              {settings.rates.map((rate, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-[var(--muted)]">
                    {rate.minWeight}g
                    {rate.maxWeight === -1
                      ? "+"
                      : ` - ${rate.maxWeight}g`}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(rate.fee)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
