import { redirect } from "next/navigation";

export default function LowStockRedirectPage() {
  redirect("/inventory/alerts");
}
