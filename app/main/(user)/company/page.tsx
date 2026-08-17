"use client";

import { useEffect, useMemo, useState } from "react";
import { CarTaxiFront, PawPrint } from "lucide-react";

import { useLanguage } from "@/components/language";
import { getSourceLanguage, getTranslation } from "@/lib/i18n";

type CompanyConfig = {
  name: Record<string, string>;
  representative: Record<string, string>;
  business: Record<string, string>;
  contact: { phone: string; email: string };
  address: {
    prefectureCode: string;
    cityCode: string;
    detail: Record<string, string>;
  };
};

type Place = { code: string; name: string };

const emptyCompany: CompanyConfig = {
  name: {},
  representative: {},
  business: {},
  contact: { phone: "", email: "" },
  address: { prefectureCode: "", cityCode: "", detail: { ja: "", en: "" } },
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
      title: getTranslation({ ja: "会社概要", en: "Company Profile" }, language),
      introduction: getTranslation({ ja: "サービスを運営する会社の基本情報です。", en: "Basic information about the company operating this service." }, language),
      name: getTranslation({ ja: "会社名", en: "Company name" }, language),
      address: getTranslation({ ja: "所在地", en: "Address" }, language),
      representative: getTranslation({ ja: "代表者", en: "Representative" }, language),
      business: getTranslation({ ja: "事業内容", en: "Business activities" }, language),
      contact: getTranslation({ ja: "連絡先", en: "Contact" }, language),
    }),
    [language],
  );

  const address = placeLanguage === "ja"
    ? [prefecture, city, getTranslation(company.address.detail, "ja")].filter(Boolean).join(" ")
    : [getTranslation(company.address.detail, "en"), city, prefecture].filter(Boolean).join(", ");

  return (
    <article className="companyPage">
      <div className="companyPageContent">
        <header className="companyPageHeading">
          <h1>
            {text.title}
            <span className="companyTitleIcons" aria-hidden="true">
              <CarTaxiFront className="companyTitleTaxi" />
              <span className="companyTitlePaws">
                <PawPrint />
                <PawPrint />
              </span>
            </span>
          </h1>
        </header>
        <section className="companyPagePanel">
          <p>{text.introduction}</p>
          <dl>
            <div>
              <dt>{text.name}</dt>
              <dd>{getTranslation(company.name, language)}</dd>
            </div>
            <div>
              <dt>{text.address}</dt>
              <dd>{address || "—"}</dd>
            </div>
            <div>
              <dt>{text.representative}</dt>
              <dd>{getTranslation(company.representative, language) || "—"}</dd>
            </div>
            <div>
              <dt>{text.business}</dt>
              <dd>{getTranslation(company.business, language) || "—"}</dd>
            </div>
            <div>
              <dt>{text.contact}</dt>
              <dd>{[company.contact.phone, company.contact.email].filter(Boolean).join(" / ") || "—"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </article>
  );
}
