"use client";

import { useEffect, useMemo, useState } from "react";

import { Breadcrumb } from "@/components/breadcrumb";
import { useLanguage } from "@/components/language";
import { getSourceLanguage, getTranslation } from "@/lib/i18n";

type CompanyConfig = {
  name: Record<string, string>;
  address: {
    prefectureCode: string;
    cityCode: string;
    detail: string;
  };
};

type Place = { code: string; name: string };

const emptyCompany: CompanyConfig = {
  name: {},
  address: { prefectureCode: "", cityCode: "", detail: "" },
};

export default function CompanyPage() {
  const { language } = useLanguage();
  const placeLanguage = getSourceLanguage(language);
  const [company, setCompany] = useState<CompanyConfig>(emptyCompany);
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/session?resource=company", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { company?: CompanyConfig } | null) => {
        if (result?.company) setCompany(result.company);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!company.address.prefectureCode) return;
    const controller = new AbortController();
    const prefectureCode = encodeURIComponent(company.address.prefectureCode);
    void Promise.all([
      fetch(`/api/session?resource=prefectures&language=${placeLanguage}`, {
        signal: controller.signal,
      }).then((response) => (response.ok ? response.json() : null)),
      fetch(
        `/api/session?resource=cities&prefecture=${prefectureCode}&language=${placeLanguage}`,
        { signal: controller.signal },
      ).then((response) => (response.ok ? response.json() : null)),
    ])
      .then(([prefectureResult, cityResult]: Array<{ places?: Place[] } | null>) => {
        setPrefecture(
          prefectureResult?.places?.find(
            (item) => item.code === company.address.prefectureCode,
          )?.name ?? "",
        );
        setCity(
          cityResult?.places?.find((item) => item.code === company.address.cityCode)
            ?.name ?? "",
        );
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [company.address.cityCode, company.address.prefectureCode, placeLanguage]);

  const text = useMemo(
    () => ({
      home: getTranslation({ ja: "Home", en: "Home" }, language),
      title: getTranslation({ ja: "会社概要", en: "Company" }, language),
      name: getTranslation({ ja: "会社名", en: "Company name" }, language),
      address: getTranslation({ ja: "所在地", en: "Address" }, language),
    }),
    [language],
  );

  const address = [prefecture, city, company.address.detail].filter(Boolean).join(" ");

  return (
    <article className="companyPage">
      <Breadcrumb items={[{ label: text.home, href: "/main" }, { label: text.title }]} />
      <div className="companyPageContent">
        <header>
          <h1>{text.title}</h1>
        </header>
        <dl>
          <div>
            <dt>{text.name}</dt>
            <dd>{getTranslation(company.name, language)}</dd>
          </div>
          <div>
            <dt>{text.address}</dt>
            <dd>{address || "—"}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
