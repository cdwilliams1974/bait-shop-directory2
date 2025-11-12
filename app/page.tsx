import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';
import { generateMetadata as genMeta } from '@/lib/seo';
import { organizationSchema } from '@/lib/schema-org';
import { Button } from '@/components/ui/button';

export const metadata = genMeta({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  path: '/',
});

async function getStates() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('listings')
    .select('state_id, states(name)')
    .order('states(name)');

  if (error) {
    console.error('Error fetching states:', error);
    return [];
  }

  const stateCount = new Map<string, number>();
  data.forEach((row: any) => {
    const stateName = row.states?.name;
    if (stateName) {
      stateCount.set(stateName, (stateCount.get(stateName) || 0) + 1);
    }
  });

  return Array.from(stateCount.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => a.state.localeCompare(b.state));
}

export default async function Home() {
  const states = await getStates();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Live Bait Shops Near You
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive directory of live bait and tackle shops across the United States
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/near-me">
              <Button size="lg" className="w-full sm:w-auto">
                <MapPin className="w-5 h-5 mr-2" />
                Find Shops Near Me
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">or browse by state below</div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Browse by State</h2>

          {states.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No listings available yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {states.map(({ state, count }) => (
                <Link
                  key={state}
                  href={`/state/${state.toLowerCase().replace(/\s+/g, '-')}`}
                  className="p-4 border rounded-lg hover:shadow-lg hover:border-blue-500 transition-all group"
                >
                  <div className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                    {state}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'shop' : 'shops'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
