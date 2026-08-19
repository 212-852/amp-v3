"use client";

import { useEffect, useMemo, useState } from "react";

import { getTranslation } from "@/lib/i18n";

export type AddressValue = {
  prefectureCode: string;
  cityCode: string;
  detail: string;
};

type Place = {
  code: string;
  name: string;
};

type AddressProps = {
  language: "ja" | "en";
  value?: AddressValue;
  initialValue?: AddressValue;
  onChange?: (value: AddressValue) => void;
  namePrefix?: string;
  variant?: "default" | "flight";
};

const emptyAddress: AddressValue = { prefectureCode: "", cityCode: "", detail: "" };

export function Address({ language, value, initialValue, onChange, namePrefix, variant = "default" }: AddressProps) {
  const [internalValue, setInternalValue] = useState<AddressValue>(value ?? initialValue ?? emptyAddress);
  const [prefectures, setPrefectures] = useState<Place[]>([]);
  const [cities, setCities] = useState<Place[]>([]);
  const currentValue = value ?? internalValue;
  const updateValue = (nextValue: AddressValue) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/session?resource=prefectures&language=${language}`, {
      cache: "force-cache",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { places?: Place[] } | null) => {
        if (result?.places) setPrefectures(result.places);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    if (!currentValue.prefectureCode) {
      const timer = window.setTimeout(() => setCities([]), 0);
      return () => window.clearTimeout(timer);
    }

    const controller = new AbortController();
    void fetch(
      `/api/session?resource=cities&prefecture=${encodeURIComponent(currentValue.prefectureCode)}&language=${language}`,
      { cache: "force-cache", signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { places?: Place[] } | null) => {
        if (result?.places) setCities(result.places);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [language, currentValue.prefectureCode]);

  const labels = useMemo(
    () => ({
      prefecture: getTranslation({ ja: "都道府県", en: "Prefecture" }, language),
      city: getTranslation({ ja: "市区町村", en: "City" }, language),
      detail: getTranslation({ ja: "住所詳細", en: "Address details" }, language),
      select: getTranslation({ ja: "選択してください", en: "Select" }, language),
    }),
    [language],
  );

  return (
    <div className={variant === "flight" ? "grid gap-4 sm:grid-cols-2" : "addressFields"}>
      <label>
        {labels.prefecture}
        <select
          name={namePrefix ? `${namePrefix}Prefecture` : undefined}
          required
          value={currentValue.prefectureCode}
          onChange={(event) =>
            updateValue({
              ...currentValue,
              prefectureCode: event.target.value,
              cityCode: "",
            })
          }
          className={variant === "flight" ? "mt-2 min-h-14 w-full rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 outline-none focus:border-[#398ee4]" : undefined}
        >
          <option value="">{labels.select}</option>
          {prefectures.map((prefecture) => (
            <option key={prefecture.code} value={prefecture.code}>
              {prefecture.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {labels.city}
        <select
          name={namePrefix ? `${namePrefix}City` : undefined}
          required
          disabled={!currentValue.prefectureCode}
          value={currentValue.cityCode}
          onChange={(event) =>
            updateValue({ ...currentValue, cityCode: event.target.value })
          }
          className={variant === "flight" ? "mt-2 min-h-14 w-full rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 outline-none focus:border-[#398ee4] disabled:opacity-55" : undefined}
        >
          <option value="">{labels.select}</option>
          {cities.map((city) => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>
      </label>
      <label className={variant === "flight" ? "sm:col-span-2" : undefined}>
        {labels.detail}
        <input
          name={namePrefix ? `${namePrefix}Detail` : undefined}
          type="text"
          value={currentValue.detail}
          onChange={(event) => updateValue({ ...currentValue, detail: event.target.value })}
          className={variant === "flight" ? "mt-2 min-h-14 w-full rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 outline-none focus:border-[#398ee4]" : undefined}
        />
      </label>
    </div>
  );
}
