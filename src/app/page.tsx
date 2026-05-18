import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Users, Send } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            Billing Builder
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
          Créez et envoyez vos factures en quelques clics.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Gérez vos clients, vos prestations et générez des PDF propres prêts à
          envoyer. Pensé pour les freelances et indépendants.
        </p>
        <div className="mt-10 flex gap-3">
          <Button asChild size="lg">
            <Link href="/auth/register">Démarrer gratuitement</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/login">J&apos;ai déjà un compte</Link>
          </Button>
        </div>

        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <Feature icon={<Users className="h-6 w-6" />} title="Gérer vos clients">
            Carnet d&apos;adresses centralisé pour vos clients récurrents.
          </Feature>
          <Feature icon={<FileText className="h-6 w-6" />} title="Créer des factures">
            Lignes de prestation, acomptes, numérotation auto, statuts.
          </Feature>
          <Feature icon={<Send className="h-6 w-6" />} title="Exporter en PDF">
            Génération PDF propre, prête à être téléchargée ou envoyée.
          </Feature>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-left">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
