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
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

export function Address({ language, value, onChange }: AddressProps) {
  const [prefectures, setPrefectures] = useState<Place[]>([]);
  const [cities, setCities] = useState<Place[]>([]);

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
    if (!value.prefectureCode) {
      const timer = window.setTimeout(() => setCities([]), 0);
      return () => window.clearTimeout(timer);
    }

    const controller = new AbortController();
    void fetch(
      `/api/session?resource=cities&prefecture=${encodeURIComponent(value.prefectureCode)}&language=${language}`,
      { cache: "force-cache", signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { places?: Place[] } | null) => {
        if (result?.places) setCities(result.places);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [language, value.prefectureCode]);

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
    <div className="addressFields">
      <label>
        {labels.prefecture}
        <select
          required
          value={value.prefectureCode}
          onChange={(event) =>
            onChange({
              ...value,
              prefectureCode: event.target.value,
              cityCode: "",
            })
          }
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
          required
          disabled={!value.prefectureCode}
          value={value.cityCode}
          onChange={(event) =>
            onChange({ ...value, cityCode: event.target.value })
          }
        >
          <option value="">{labels.select}</option>
          {cities.map((city) => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {labels.detail}
        <input
          type="text"
          value={value.detail}
          onChange={(event) => onChange({ ...value, detail: event.target.value })}
        />
      </label>
    </div>
  );
}
