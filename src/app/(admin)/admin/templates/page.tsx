import { redirect } from "next/navigation";
import { AdminTemplatesForm } from "@/components/AdminTemplatesForm";
import { auth } from "@/lib/auth";
import { ensureMessageTemplates } from "@/lib/customer-emails";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const templates = await ensureMessageTemplates();

  return (
    <div className="admin-panel">
      <h1>Имейл шаблони</h1>
      <p className="muted">
        Текстовете се ползват при одобрен/отказан макет, изпратена пратка и
        напомняне за превод. Ако Resend липсва, админът може да копира текста за SMS.
      </p>
      <AdminTemplatesForm
        initial={templates.map((row) => ({
          key: row.key,
          subject: row.subject,
          body: row.body,
        }))}
      />
    </div>
  );
}
