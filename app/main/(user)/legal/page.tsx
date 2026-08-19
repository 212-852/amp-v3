"use client";

import { FileText, PawPrint } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/language";
import { getSourceLanguage, getTranslation } from "@/lib/i18n";

type CompanyConfig = {
  name: Record<string, string>;
  representative: Record<string, string>;
  contact: { phone: string; email: string };
  address: {
    prefectureCode: string;
    cityCode: string;
    detail: Record<string, string>;
  };
  legal: {
    seller: Record<string, string>;
    operationsManager: Record<string, string>;
    serviceName: Record<string, string>;
    serviceDescription: Record<string, string>;
    price: Record<string, string>;
    additionalFees: Record<string, string>;
    paymentMethods: Record<string, string>;
    paymentTiming: Record<string, string>;
    serviceTiming: Record<string, string>;
    cancellationChanges: Record<string, string>;
    refunds: Record<string, string>;
    applicationDeadline: Record<string, string>;
    cancellationRefunds: Record<string, string>;
  };
};

type Place = { code: string; name: string };

const emptyCompany: CompanyConfig = {
  name: {},
  representative: {},
  contact: { phone: "", email: "" },
  address: { prefectureCode: "", cityCode: "", detail: {} },
  legal: { seller: {}, operationsManager: {}, serviceName: {}, serviceDescription: {}, price: {}, additionalFees: {}, paymentMethods: {}, paymentTiming: {}, serviceTiming: {}, cancellationChanges: {}, refunds: {}, applicationDeadline: {}, cancellationRefunds: {} },
};

export default function LegalPage() {
  const { language } = useLanguage();
  const placeLanguage = getSourceLanguage(language);
  const [company, setCompany] = useState<CompanyConfig>(emptyCompany);
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");

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

  useEffect(() => {
    if (!company.address.prefectureCode) return;
    const controller = new AbortController();
    const prefectureCode = encodeURIComponent(company.address.prefectureCode);
    void Promise.all([
      fetch(`/api/session?resource=prefectures&language=${placeLanguage}`, { signal: controller.signal }).then((response) => response.ok ? response.json() : null),
      fetch(`/api/session?resource=cities&prefecture=${prefectureCode}&language=${placeLanguage}`, { signal: controller.signal }).then((response) => response.ok ? response.json() : null),
    ])
      .then(([prefectureResult, cityResult]: Array<{ places?: Place[] } | null>) => {
        setPrefecture(prefectureResult?.places?.find((item) => item.code === company.address.prefectureCode)?.name ?? "");
        setCity(cityResult?.places?.find((item) => item.code === company.address.cityCode)?.name ?? "");
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [company.address.cityCode, company.address.prefectureCode, placeLanguage]);

  const copy = useMemo(() => {
    const t = (ja: string, en: string) => getTranslation({ ja, en }, language);
    return {
      title: t("特定商取引法に基づく表記", "Commercial Transactions Disclosure"),
      introduction: t("本ページは、わんだにゃー株式会社が運営・提供する各Webサイトおよびサービスに共通して適用されます。共通事項とサービスごとの条件をご案内します。", "This disclosure applies to all websites and services operated by Wan Da Nya Inc. It sets out both common provisions and service-specific terms."),
      common: t("全サービス共通", "All services"),
      specific: t("サービス別", "By service"),
      provider: t("事業者情報", "Business information"),
      businessName: t("事業者名", "Business name"),
      representative: t("代表者", "Representative"),
      address: t("所在地", "Address"),
      phone: t("電話番号", "Phone"),
      email: t("メールアドレス", "Email"),
      applicable: t("適用サービス", "Applicable services"),
      applicableText: t("本ページは、以下のサービスおよび今後当社が追加するサービスに適用します。", "This disclosure applies to the following services and any services added by the company in the future."),
      services: [t("ペットタクシー", "Pet taxi"), "PawsFlight Japan", t("国際ペット輸送", "International pet transport"), t("ハンドキャリー", "Hand carry"), t("検疫・輸出入サポート", "Quarantine and import/export support"), t("その他当社が提供するサービス", "Other services provided by the company")],
      priceTitle: t("販売価格・サービス料金", "Prices and service fees"),
      priceText: t("各サービスページ、予約画面または個別見積書に表示します。", "Prices are shown on each service page, booking screen, or individual quotation."),
      serviceName: t("サービス名", "Service name"),
      serviceDescription: t("サービス内容", "Service description"),
      extraTitle: t("サービス料金以外の費用", "Costs other than service fees"),
      taxi: t("国内ペットタクシー", "Domestic pet taxi"),
      taxiExtra: t("高速道路料金、駐車料金、待機料金等が発生する場合があります。", "Highway tolls, parking fees, waiting charges, and similar costs may apply."),
      international: t("国際ペット輸送", "International pet transport"),
      internationalExtra: t("航空運賃、検疫費用、通関関連費用、検査・証明書費用、クレート代、現地輸送費等が発生する場合があります。", "Airfare, quarantine and customs fees, inspection and certificate fees, crate charges, local transportation, and similar costs may apply."),
      paymentTitle: t("支払方法・支払時期", "Payment methods and timing"),
      paymentMethod: t("支払方法", "Payment methods"),
      paymentWhen: t("支払時期", "Payment timing"),
      taxiPayment: t("当日決済または事前決済等、予約画面または申込時にご案内する方法でお支払いいただきます。", "Payment is made on the service date or in advance, as specified during booking or application."),
      internationalPayment: t("見積承諾後の事前決済または請求書払い等、個別見積書または申込内容で合意した方法でお支払いいただきます。", "Payment is made in advance after quotation acceptance or by invoice, as agreed in the quotation or application."),
      timingTitle: t("サービス提供時期", "Service delivery timing"),
      reservation: t("予約型サービス", "Reservation services"),
      reservationTiming: t("予約確定日時に提供します。", "Services are provided at the confirmed reservation date and time."),
      support: t("国際輸送・手続支援", "International transport and procedure support"),
      supportTiming: t("個別見積書・申込内容等で合意した日程に従って提供します。", "Services are provided according to the schedule agreed in the quotation or application."),
      applicationDeadline: t("申込期限", "Application deadline"),
      cancellationTitle: t("キャンセル・変更・返金", "Cancellation, changes, and refunds"),
      taxiCancellation: t("予約画面、サービスページまたは予約確定時に提示する条件を適用します。", "The terms shown on the booking screen, service page, or booking confirmation apply."),
      internationalCancellation: t("手配開始後に発生した航空会社・検疫・通関・検査・証明書・クレート・現地輸送等の費用は、返金できない場合があります。詳細は個別見積書または申込内容に表示します。", "Costs incurred after arrangements begin, including airline, quarantine, customs, inspection, certificate, crate, and local transportation costs, may be non-refundable. Details are stated in the quotation or application."),
      other: t("その他サービス", "Other services"),
      otherCancellation: t("各サービスページ、予約画面、個別見積書または申込内容に表示する条件を適用します。", "The terms shown on the relevant service page, booking screen, quotation, or application apply."),
      lawTitle: t("準拠法", "Governing law"),
      law: t("当社が提供するすべてのサービスおよびこれらに関連する契約、規約等の解釈・適用については、日本法を準拠法とします。", "Japanese law governs all services provided by the company and the interpretation and application of related contracts and terms."),
      jurisdictionTitle: t("管轄裁判所", "Jurisdiction"),
      jurisdiction: t("当社サービスに関連して紛争が生じた場合は、法令に別段の定めがある場合を除き、当社本店所在地を管轄する日本の裁判所を第一審の管轄裁判所とします。", "Unless otherwise provided by law, the Japanese court with jurisdiction over the location of the company's head office shall be the court of first instance for disputes related to the company's services."),
    };
  }, [language]);

  const address = placeLanguage === "ja"
    ? [prefecture, city, getTranslation(company.address.detail, "ja")].filter(Boolean).join(" ")
    : [getTranslation(company.address.detail, "en"), city, prefecture].filter(Boolean).join(", ");
  const seller = getTranslation(company.legal.seller, language) || getTranslation(company.name, language) || "わんだにゃー株式会社";
  const representative = getTranslation(company.legal.operationsManager, language) || getTranslation(company.representative, language) || (placeLanguage === "ja" ? "代表取締役 沖野真記" : "Maki Okino, Representative Director");
  const flightName = getTranslation(company.legal.serviceName, language) || "PawsFlight Japan";
  const flightDescription = getTranslation(company.legal.serviceDescription, language) || (placeLanguage === "ja" ? "国際ペット輸送、ハンドキャリー、検疫・輸出入手続支援、国内輸送等" : "International pet transport, hand carry, quarantine and import/export support, domestic transport, etc.");

  const badge = (label: string, type: "common" | "specific") => <span className={`legalBadge legalBadge--${type}`}>{label}</span>;
  const serviceTerm = (title: string, description: string) => (
    <div className="legalServiceTerm"><h3>{title}</h3><p>{description}</p></div>
  );

  return (
    <article className="companyPage legalPage">
      <div className="companyPageContent">
        <header className="companyPageHeading">
          <h1>{copy.title}<span className="companyTitleIcons" aria-hidden="true"><FileText /><PawPrint /></span></h1>
          <p className="legalIntroduction">{copy.introduction}</p>
        </header>
        <div className="companyPagePanel legalSections">
          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">01</span><div>{badge(copy.common, "common")}<h2>{copy.provider}</h2></div></div>
            <dl className="legalInfo">
              <div><dt>{copy.businessName}</dt><dd>{seller}</dd></div>
              <div><dt>{copy.representative}</dt><dd>{representative}</dd></div>
              <div><dt>{copy.address}</dt><dd>{address || "—"}</dd></div>
              <div><dt>{copy.phone}</dt><dd>{company.contact.phone || "—"}</dd></div>
              <div><dt>{copy.email}</dt><dd>{company.contact.email || "—"}</dd></div>
            </dl>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">02</span><div>{badge(copy.common, "common")}<h2>{copy.applicable}</h2></div></div>
            <p>{copy.applicableText}</p>
            <ul className="legalServiceList">{copy.services.map((service) => <li key={service}>{service === "PawsFlight Japan" ? flightName : service}</li>)}</ul>
            <div className="legalServiceSummary"><strong>{copy.serviceName}</strong><span>{flightName}</span><strong>{copy.serviceDescription}</strong><span>{flightDescription}</span></div>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">03</span><div>{badge(copy.specific, "specific")}<h2>{copy.priceTitle}</h2></div></div>
            <p>{getTranslation(company.legal.price, language) || copy.priceText}</p>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">04</span><div>{badge(copy.specific, "specific")}<h2>{copy.extraTitle}</h2></div></div>
            <div className="legalServiceGrid">{serviceTerm(copy.taxi, copy.taxiExtra)}{serviceTerm(flightName, getTranslation(company.legal.additionalFees, language) || copy.internationalExtra)}</div>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">05</span><div>{badge(copy.specific, "specific")}<h2>{copy.paymentTitle}</h2></div></div>
            <div className="legalServiceGrid">{serviceTerm(copy.paymentMethod, getTranslation(company.legal.paymentMethods, language) || copy.internationalPayment)}{serviceTerm(copy.paymentWhen, getTranslation(company.legal.paymentTiming, language) || copy.internationalPayment)}</div>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">06</span><div>{badge(copy.specific, "specific")}<h2>{copy.timingTitle}</h2></div></div>
            <div className="legalServiceGrid">{serviceTerm(flightName, getTranslation(company.legal.serviceTiming, language) || copy.supportTiming)}{getTranslation(company.legal.applicationDeadline, language) ? serviceTerm(copy.applicationDeadline, getTranslation(company.legal.applicationDeadline, language)) : serviceTerm(copy.reservation, copy.reservationTiming)}</div>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">07</span><div>{badge(copy.specific, "specific")}<h2>{copy.cancellationTitle}</h2></div></div>
            <div className="legalServiceGrid legalServiceGrid--three">{serviceTerm(copy.taxi, copy.taxiCancellation)}{serviceTerm(flightName, getTranslation(company.legal.cancellationChanges, language) || copy.internationalCancellation)}{serviceTerm(copy.other, getTranslation(company.legal.refunds, language) || copy.otherCancellation)}</div>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">08</span><div>{badge(copy.common, "common")}<h2>{copy.lawTitle}</h2></div></div>
            <p>{copy.law}</p>
          </section>

          <section className="legalSection">
            <div className="legalSectionHeading"><span className="legalNumber">09</span><div>{badge(copy.common, "common")}<h2>{copy.jurisdictionTitle}</h2></div></div>
            <p>{copy.jurisdiction}</p>
          </section>
        </div>
      </div>
    </article>
  );
}
