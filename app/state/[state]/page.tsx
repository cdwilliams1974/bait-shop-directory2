import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { generateMetadata as genMeta, generateStateTitle, generateStateDescription } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema-org';
import { SITE_URL } from '@/lib/constants';

interface StatePageProps {
  params: {
    state: string;
  };
}

async function getStateData(stateSlug: string) {
  const supabase = createClient();

  const { data: stateData } = await supabase
    .from('states')
    .select('id, name')
    .eq('slug', stateSlug)
    .maybeSingle();

  if (!stateData) {
    return null;
  }

  const { data, error } = await supabase
    .from('listings')
    .select('city_id, cities(name)')
    .eq('state_id', (stateData as any).id)
    .order('cities(name)');

  if (error || !data || data.length === 0) {
    return null;
  }

  const cityCount = new Map<string, number>();

  data.forEach((row: any) => {
    const cityName = row.cities?.name;
    if (cityName) {
      cityCount.set(cityName, (cityCount.get(cityName) || 0) + 1);
    }
  });

  const cities = Array.from(cityCount.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => a.city.localeCompare(b.city));

  return {
    stateName: (stateData as any).name,
    cities,
    totalListings: data.length,
  };
}

export async function generateMetadata({ params }: StatePageProps) {
  const stateData = await getStateData(params.state);

  if (!stateData) {
    return {};
  }

  return genMeta({
    title: generateStateTitle(stateData.stateName, stateData.totalListings),
    description: generateStateDescription(stateData.stateName, stateData.totalListings),
    path: `/state/${params.state}`,
  });
}

export default async function StatePage({ params }: StatePageProps) {
  const stateData = await getStateData(params.state);

  if (!stateData) {
    notFound();
  }

  const { stateName, cities, totalListings } = stateData;

  const breadcrumbItems = [{ label: stateName }];

  const itemList = cities.map((city) => ({
    name: `${city.city}, ${stateName}`,
    url: `${SITE_URL}/state/${params.state}/${city.city.toLowerCase().replace(/\s+/g, '-')}`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbItems.map((item) => ({
            name: item.label,
            path: `/state/${params.state}`,
          })))),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(itemList)) }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Live Bait Shops in {stateName}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {totalListings} {totalListings === 1 ? 'shop' : 'shops'} across {cities.length}{' '}
            {cities.length === 1 ? 'city' : 'cities'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.map(({ city, count }) => (
              <Link
                key={city}
                href={`/state/${params.state}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                className="p-4 border rounded-lg hover:shadow-lg hover:border-blue-500 transition-all group"
              >
                <div className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                  {city}
                </div>
                <div className="text-sm text-muted-foreground">
                  {count} {count === 1 ? 'shop' : 'shops'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
