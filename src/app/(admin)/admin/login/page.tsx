import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const callbackUrl = String(formData.get("callbackUrl") || "/admin");

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(
          `/admin/login?error=credentials&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      }
      throw error;
    }
  }

  return (
    <div className="admin-panel admin-login">
      <form className="admin-card" action={loginAction}>
        <h1>Вход в админ</h1>
        <p className="muted">Studio Breza — управление на поръчки и каталог</p>
        <input
          type="hidden"
          name="callbackUrl"
          value={params.callbackUrl || "/admin"}
        />
        <label className="field">
          <span>Имейл</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
          />
        </label>
        <label className="field">
          <span>Парола</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>
        {params.error ? (
          <p className="error">Грешен имейл или парола</p>
        ) : null}
        <button type="submit" className="btn btn-primary">
          Вход
        </button>
      </form>
    </div>
  );
}
