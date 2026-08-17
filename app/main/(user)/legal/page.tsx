"use client";

import { FileText, PawPrint } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/language";
import { getTranslation } from "@/lib/i18n";

const services = ["PET TAXI", "ペットタクシー東京", "PET TAXI AIRPORT", "PawsFlight Japan"];

type CompanyConfig = {
  name: Record<string, string>;
  contact: { phone: string; email: string };
  legal: {
    seller: Record<string, string>;
    operationsManager: Record<string, string>;
    price: Record<string, string>;
    additionalFees: Record<string, string>;
    paymentMethods: Record<string, string>;
    cancellationRefunds: Record<string, string>;
  };
};

const emptyCompany: CompanyConfig = {
  name: {},
  contact: { phone: "", email: "" },
  legal: { seller: {}, operationsManager: {}, price: {}, additionalFees: {}, paymentMethods: {}, cancellationRefunds: {} },
};

export default function LegalPage() {
  const { language } = useLanguage();
  const [company, setCompany] = useState<CompanyConfig>(emptyCompany);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/session?resource=company", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((result: { company?: CompanyConfig } | null) => {
        if (result?.company) setCompany(result.company);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const text = useMemo(() => ({
    title: getTranslation({ ja: "特定商取引法に基づく表記", en: "Commercial Transactions Disclosure" }, language),
    introduction: getTranslation({ ja: "当社が提供する各サービスの取引条件をご案内します。", en: "Transaction terms for each service provided by our company." }, language),
    seller: getTranslation({ ja: "販売事業者", en: "Service provider" }, language),
    operationsManager: getTranslation({ ja: "運営責任者", en: "Operations manager" }, language),
    price: getTranslation({ ja: "料金", en: "Prices" }, language),
    additionalFees: getTranslation({ ja: "追加費用", en: "Additional fees" }, language),
    paymentMethods: getTranslation({ ja: "支払方法", en: "Payment methods" }, language),
    cancellationRefunds: getTranslation({ ja: "キャンセル・返金条件", en: "Cancellation and refund policy" }, language),
    contact: getTranslation({ ja: "連絡先", en: "Contact" }, language),
    services: getTranslation({ ja: "対象サービス", en: "Services" }, language),
  }), [language]);

  return (
    <article className="companyPage">
      <div className="companyPageContent">
        <header className="companyPageHeading">
          <h1>{text.title}<span className="companyTitleIcons" aria-hidden="true"><FileText /><PawPrint /></span></h1>
        </header>
        <section className="companyPagePanel">
          <p>{text.introduction}</p>
          <dl>
            <div><dt>{text.seller}</dt><dd>{getTranslation(company.legal.seller, language) || getTranslation(company.name, language) || "—"}</dd></div>
            <div><dt>{text.operationsManager}</dt><dd>{getTranslation(company.legal.operationsManager, language) || "—"}</dd></div>
            <div><dt>{text.contact}</dt><dd>{[company.contact.phone, company.contact.email].filter(Boolean).join(" / ") || "—"}</dd></div>
            <div><dt>{text.services}</dt><dd>{services.join(" / ")}</dd></div>
            <div><dt>{text.price}</dt><dd>{getTranslation(company.legal.price, language) || "—"}</dd></div>
            <div><dt>{text.additionalFees}</dt><dd>{getTranslation(company.legal.additionalFees, language) || "—"}</dd></div>
            <div><dt>{text.paymentMethods}</dt><dd>{getTranslation(company.legal.paymentMethods, language) || "—"}</dd></div>
            <div><dt>{text.cancellationRefunds}</dt><dd>{getTranslation(company.legal.cancellationRefunds, language) || "—"}</dd></div>
          </dl>
        </section>
      </div>
    </article>
  );
}
