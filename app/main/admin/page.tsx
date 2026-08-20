import type { Metadata } from "next";
import { ArrowRight, Building2, BusFront, Handshake, MapPin, PawPrint, Plane } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { listInboxOrders } from "@/lib/inbox";

export const metadata: Metadata = {
  title: "Admin | PET TAXI",
};

const copy = {
  ja: { title: "進行中のオーダー", empty: "進行中のオーダーはありません。", all: "オーダー一覧へ", headquarters: "本部受付", external: "外部", works: { transport: "送迎", charter: "貸切", airport_shuttle: "空港シャトル", air_transport: "航空輸送", quarantine: "検疫・手続き", other: "その他" } },
  en: { title: "Active orders", empty: "There are no active orders.", all: "View all orders", headquarters: "Head office", external: "External", works: { transport: "Transport", charter: "Charter", airport_shuttle: "Airport shuttle", air_transport: "Air transport", quarantine: "Quarantine support", other: "Other" } },
} as const;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  const language = session?.language === "en" ? "en" : "ja";
  const text = copy[language];
  const orders = await listInboxOrders(5, true);

  return (
    <section className="adminOrderDashboard">
      <header><h1>{text.title}</h1></header>
      <div className="adminOrderList">
        {orders.map((order) => {
          const IntakeIcon = order.intakeType === "external" ? Handshake : Building2;
          const BusinessIcon = order.businessUnit === "pawsflight" ? Plane : order.businessUnit === "airport" ? BusFront : order.businessUnit === "tokyo" ? MapPin : PawPrint;
          const businessName = order.businessUnit === "pawsflight" ? "PawsFlight" : order.businessUnit === "airport" ? "AirPort" : order.businessUnit === "tokyo" ? "Tokyo" : "WanDaNya";
          return <article className="adminOrderItem" key={order.orderUuid}>
            <span className={`adminOrderIcon is${order.businessUnit}`}><BusinessIcon aria-hidden="true" /></span>
            <div><span><strong>{order.title}</strong><time dateTime={order.updatedAt}>{new Intl.DateTimeFormat(language === "en" ? "en" : "ja-JP", { month: "short", day: "numeric" }).format(new Date(order.updatedAt))}</time></span><small>{order.orderCode}</small><p>{order.customerName || "—"}</p><footer><span><IntakeIcon aria-hidden="true" />{order.intakeType === "external" ? text.external : text.headquarters}</span><span><BusinessIcon aria-hidden="true" />{businessName}</span><span>{text.works[order.workType]}</span></footer></div>
          </article>;
        })}
        {orders.length === 0 ? <p className="adminOrderEmpty">{text.empty}</p> : null}
      </div>
      <Link className="adminOrderAll" href="admin/orders">{text.all}<ArrowRight aria-hidden="true" /></Link>
    </section>
  );
}
