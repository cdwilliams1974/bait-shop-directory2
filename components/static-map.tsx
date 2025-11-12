import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getStaticMapUrl } from '@/lib/googlemaps';

interface StaticMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
  width?: number;
  height?: number;
  zoom?: number;
  className?: string;
}

export function StaticMap({
  lat,
  lng,
  name,
  address,
  width = 600,
  height = 400,
  zoom = 15,
  className = '',
}: StaticMapProps) {
  const mapUrl = getStaticMapUrl({ lat, lng, width, height, zoom });
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <Card className={className}>
      <a
        href={googleMapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative group"
      >
        <div className="relative w-full" style={{ paddingBottom: `${(height / width) * 100}%` }}>
          <Image
            src={mapUrl}
            alt={`Map showing location of ${name}`}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">{address}</div>
        </div>
        <div className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg group-hover:bg-blue-700 transition-colors">
          View on Google Maps
        </div>
      </a>
    </Card>
  );
}
