import { Building2, CarFront, Handshake, Plane } from "lucide-react";
import { cookies } from "next/headers";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { listInboxOrders } from "@/lib/inbox";

export const metadata = { title: "オーダー | Admin" };

const copy = {
  ja: { title: "オーダー", empty: "オーダーはありません。", headquarters: "本部受付", external: "外部", transport: "送迎", flight: "PawsFlight", statuses: { draft: "下書き", open: "受付", confirmed: "確定", in_progress: "進行中", completed: "完了", cancelled: "キャンセル" } },
  en: { title: "Orders", empty: "There are no orders.", headquarters: "Head office", external: "External", transport: "Transport", flight: "PawsFlight", statuses: { draft: "Draft", open: "Open", confirmed: "Confirmed", in_progress: "In progress", completed: "Completed", cancelled: "Cancelled" } },
} as const;

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  const language = session?.language === "en" ? "en" : "ja";
  const text = copy[language];
  const orders = await listInboxOrders();

  return <section className="adminOrdersPage">
    <header><h1>{text.title}</h1></header>
    <div className="adminOrderList">
      {orders.map((order) => {
        const IntakeIcon = order.intakeType === "external" ? Handshake : Building2;
        const ServiceIcon = order.serviceType === "flight" ? Plane : CarFront;
        const status = text.statuses[order.status as keyof typeof text.statuses] ?? order.status;
        return <article className="adminOrderItem" key={order.orderUuid}>
          <span className={`adminOrderIcon is${order.serviceType === "flight" ? "Flight" : "Transport"}`}><ServiceIcon aria-hidden="true" /></span>
          <div><span><strong>{order.title}</strong><time dateTime={order.updatedAt}>{new Intl.DateTimeFormat(language === "en" ? "en" : "ja-JP", { dateStyle: "medium" }).format(new Date(order.updatedAt))}</time></span><small>{order.orderCode}</small><p>{order.customerName || "—"}</p><footer><span><IntakeIcon aria-hidden="true" />{order.intakeType === "external" ? text.external : text.headquarters}</span><span><ServiceIcon aria-hidden="true" />{order.serviceType === "flight" ? text.flight : text.transport}</span><b>{status}</b></footer></div>
        </article>;
      })}
      {orders.length === 0 ? <p className="adminOrderEmpty">{text.empty}</p> : null}
    </div>
  </section>;
}
