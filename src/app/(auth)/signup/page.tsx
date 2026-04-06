import SignupClient from "./SignupClient";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  return <SignupClient nextUrl={sp.next} />;
}

