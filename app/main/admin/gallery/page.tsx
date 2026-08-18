import { redirect } from "next/navigation";

export default function GalleryPage() {
  redirect("/main/admin/pets?tab=stories");
}
