"use client";

import { FileText, PawPrint } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/language";
import { getTranslation } from "@/lib/i18n";

const services = ["PET TAXI", "ペットタクシー東京", "PET TAXI AIRPORT", "PawsFlight Japan"];

export default function LegalPage() {
  const { language } = useLanguage();
  const [companyName, setCompanyName] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/session?resource=company", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((result: { company?: { name?: Record<string, string> } } | null) => {
        if (result?.company?.name) setCompanyName(result.company.name);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const text = useMemo(() => ({
    title: getTranslation({ ja: "特定商取引法に基づく表記", en: "Commercial Transactions Disclosure" }, language),
    introduction: getTranslation({ ja: "当社が提供する各サービスの取引条件をご案内します。", en: "Transaction terms for each service provided by our company." }, language),
    seller: getTranslation({ ja: "販売事業者", en: "Service provider" }, language),
    services: getTranslation({ ja: "対象サービス", en: "Services" }, language),
    notice: getTranslation({ ja: "料金・支払方法・キャンセル条件などの詳細は、各サービスのお見積書および契約内容に記載します。", en: "Prices, payment methods, cancellation terms, and other details are stated in each service quotation and agreement." }, language),
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
            <div><dt>{text.seller}</dt><dd>{getTranslation(companyName, language) || "—"}</dd></div>
            <div><dt>{text.services}</dt><dd>{services.join(" / ")}</dd></div>
            <div><dt>{getTranslation({ ja: "取引条件", en: "Transaction terms" }, language)}</dt><dd>{text.notice}</dd></div>
          </dl>
        </section>
      </div>
    </article>
  );
}
