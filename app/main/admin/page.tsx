import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | PET TAXI",
};

export default function AdminPage() {
  return (
    <section className="routePage">
      <h1>Admin</h1>
      <p>Admin page is ready.</p>
    </section>
  );
}
