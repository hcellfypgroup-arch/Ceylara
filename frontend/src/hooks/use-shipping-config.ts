"use client";

import { useEffect, useState, useCallback } from "react";
import type { ShippingRate } from "@/lib/services/shipping.service";

export type ShippingConfig = {
  rates: ShippingRate[];
  freeShippingThreshold: number;
  expressShippingSurcharge: number;
};

let cachedConfig: ShippingConfig | null = null;
let inflightPromise: Promise<ShippingConfig> | null = null;

const fetchShippingConfig = async (): Promise<ShippingConfig> => {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (!inflightPromise) {
    inflightPromise = fetch("/api/shipping")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load shipping settings");
        }
        const payload = await response.json();
        const data = payload.data as ShippingConfig;
        cachedConfig = data;
        inflightPromise = null;
        return data;
      })
      .catch((error) => {
        inflightPromise = null;
        throw error;
      });
  }

  return inflightPromise;
};

export const useShippingConfig = () => {
  const [data, setData] = useState<ShippingConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!cachedConfig) {
      fetchShippingConfig()
        .then((config) => {
          if (!isMounted) return;
          setData(config);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("Shipping config fetch failed:", err);
          setError(err as Error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = useCallback(() => {
    cachedConfig = null;
    setLoading(true);
    fetchShippingConfig()
      .then((config) => {
        setData(config);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Shipping config refresh failed:", err);
        setError(err as Error);
        setLoading(false);
      });
  }, []);

  return { data, loading, error, refresh };
};



