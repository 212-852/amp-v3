import type { Metadata } from "next";
import { ArrowRight, Building2, CarFront, Handshake, Plane } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { listInboxOrders } from "@/lib/inbox";

export const metadata: Metadata = {
  title: "Admin | PET TAXI",
};

const copy = {
  ja: { title: "進行中のオーダー", empty: "進行中のオーダーはありません。", all: "オーダー一覧へ", headquarters: "本部受付", external: "外部", transport: "送迎", flight: "PawsFlight" },
  en: { title: "Active orders", empty: "There are no active orders.", all: "View all orders", headquarters: "Head office", external: "External", transport: "Transport", flight: "PawsFlight" },
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
          const ServiceIcon = order.serviceType === "flight" ? Plane : CarFront;
          return <article className="adminOrderItem" key={order.orderUuid}>
            <span className={`adminOrderIcon is${order.serviceType === "flight" ? "Flight" : "Transport"}`}><ServiceIcon aria-hidden="true" /></span>
            <div><span><strong>{order.title}</strong><time dateTime={order.updatedAt}>{new Intl.DateTimeFormat(language === "en" ? "en" : "ja-JP", { month: "short", day: "numeric" }).format(new Date(order.updatedAt))}</time></span><small>{order.orderCode}</small><p>{order.customerName || "—"}</p><footer><span><IntakeIcon aria-hidden="true" />{order.intakeType === "external" ? text.external : text.headquarters}</span><span><ServiceIcon aria-hidden="true" />{order.serviceType === "flight" ? text.flight : text.transport}</span></footer></div>
          </article>;
        })}
        {orders.length === 0 ? <p className="adminOrderEmpty">{text.empty}</p> : null}
      </div>
      <Link className="adminOrderAll" href="admin/orders">{text.all}<ArrowRight aria-hidden="true" /></Link>
    </section>
  );
}
