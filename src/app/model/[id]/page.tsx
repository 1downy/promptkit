import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_ENTRIES, getEntryById, getSourceQuality } from '@/lib/promptkit/system-prompts';
import type { SystemPromptEntry } from '@/lib/promptkit/types';
import { ModelPromptView } from '@/components/model-prompt-view';

export function generateStaticParams() {
  return ALL_ENTRIES.map((entry) => ({ id: entry.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = getEntryById(id);
  if (!entry) return {};

  const title = `${entry.modelName} System Prompt — ${entry.provider} | PromptKit`;
  const description = `${entry.description} Expert-crafted system prompt for ${entry.modelName} by ${entry.provider}. Copy and paste into ChatGPT, Claude, or any AI chatbot.`;
  const url = `https://promptkit.qzz.io/model/${entry.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'PromptKit',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const QUALITY_CONFIG = {
  verified: { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  partial: { label: 'Partial', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  limited: { label: 'Limited Docs', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  text: 'Text', image: 'Image', video: 'Video', code: 'Code', vision: 'Vision',
  character: 'Character', '3d': '3D', audio: 'Audio', design: 'Design',
  embedding: 'Embedding', moderation: 'Moderation', world: 'World',
};

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getEntryById(id);
  if (!entry) notFound();

  const quality = getSourceQuality(entry);
  const qc = QUALITY_CONFIG[quality];
  const categoryLabel = CATEGORY_LABELS[entry.category] ?? entry.category;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://promptkit.qzz.io' },
          { '@type': 'ListItem', position: 2, name: categoryLabel, item: `https://promptkit.qzz.io/?category=${entry.category}` },
          { '@type': 'ListItem', position: 3, name: entry.modelName, item: `https://promptkit.qzz.io/model/${entry.id}` },
        ],
      },
      {
        '@type': 'Article',
        headline: `${entry.modelName} System Prompt`,
        description: entry.description,
        author: { '@type': 'Organization', name: entry.provider },
        publisher: { '@type': 'Organization', name: 'PromptKit', url: 'https://promptkit.qzz.io' },
        dateModified: entry.lastVerified,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://promptkit.qzz.io/model/${entry.id}` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl" role="banner">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <img src="/icon.svg" alt="PromptKit" className="w-8 h-8" />
                <div className="text-left">
                  <h1 className="text-lg font-bold tracking-tight leading-none">
                    Prompt<span className="text-amber-500">Kit</span>
                  </h1>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">System Prompt Library</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8" role="main">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li><Link href="/" className="hover:text-amber-500 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/?category=${entry.category}`} className="hover:text-amber-500 transition-colors">{categoryLabel}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground font-medium" aria-current="page">{entry.modelName}</li>
            </ol>
          </nav>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight mb-2">{entry.modelName}</h1>
          <p className="text-muted-foreground mb-1">{entry.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8">
            <span>By </span><Link href={`/?provider=${encodeURIComponent(entry.provider)}`} className="hover:text-amber-500 transition-colors">{entry.provider}</Link>
            <span>&bull;</span>
            <span>Version: {entry.version}</span>
            <span>&bull;</span>
            <span>Last verified: {entry.lastVerified}</span>
            <span>&bull;</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${qc.className}`}>
              {qc.label}
            </span>
          </div>

          {/* How to Use */}
          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-8" aria-labelledby="how-to-use">
            <h2 id="how-to-use" className="text-sm font-semibold mb-3 flex items-center gap-2">
              ⚡ How to Use This System Prompt
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="bg-amber-500/20 text-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Copy the system prompt below</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-amber-500/20 text-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Paste it into your AI chatbot (ChatGPT, Claude, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-amber-500/20 text-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span>Ask: &ldquo;Generate a prompt for [your goal]&rdquo;</span>
              </li>
            </ol>
          </section>

          {/* System Prompt */}
          <section className="mb-8" aria-labelledby="system-prompt-heading">
            <h2 id="system-prompt-heading" className="text-sm font-semibold mb-3 flex items-center gap-2">
              ✨ System Prompt
            </h2>
            <ModelPromptView systemPrompt={entry.systemPrompt} shortVersion={entry.shortVersion} ecosystem={entry.ecosystem} category={entry.category} />
          </section>

          {/* Tips */}
          {entry.tips.length > 0 && (
            <section className="mb-8" aria-labelledby="tips-heading">
              <h2 id="tips-heading" className="text-sm font-semibold mb-3 flex items-center gap-2">
                💡 Pro Tips
              </h2>
              <ul className="space-y-2 list-none p-0 m-0">
                {entry.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500 shrink-0 mt-0.5">&bull;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Sources */}
          <section className="mb-8" aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="text-sm font-semibold mb-3 flex items-center gap-2">
              📚 Sources &amp; References
            </h2>
            <div className="space-y-2">
              {entry.sources.map((source, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{source.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{source.type}</span>
                      {source.date && <span className="text-[10px] text-muted-foreground">{source.date}</span>}
                    </div>
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-500 hover:text-amber-400 text-xs shrink-0"
                    >
                      View ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-8 border-t border-border">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 transition-colors text-sm font-medium"
            >
              ← Browse all system prompts
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
