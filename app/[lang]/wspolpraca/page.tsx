import { redirect } from "next/navigation";

export default function WspolpracaRedirectPage({ params: { lang } }: { params: { lang: string } }) {
  redirect(`/${lang}/#contact`);
}
