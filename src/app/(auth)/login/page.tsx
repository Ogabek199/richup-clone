import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  return <LoginClient nextUrl={sp.next} />;
}

