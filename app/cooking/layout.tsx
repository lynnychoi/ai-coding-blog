import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getExpectedToken, AUTH_COOKIE } from "../../lib/auth";

export default async function CookingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const expected = await getExpectedToken();

  if (token !== expected) {
    redirect("/cooking/login");
  }

  return <>{children}</>;
}
