import Link from 'next/link';
import { MapPin, Phone, Globe, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/distance';

interface ListingCardProps {
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string | null;
  website?: string | null;
  baitTypes?: string[];
  rating?: number | null;
  reviewsCount?: number;
  isVerified?: boolean;
  distance?: number;
}

export function ListingCard({
  slug,
  name,
  address,
  city,
  state,
  phone,
  website,
  baitTypes = [],
  rating,
  reviewsCount = 0,
  isVerified = false,
  distance,
}: ListingCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">
            <Link
              href={`/listing/${slug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {name}
            </Link>
          </CardTitle>
          {isVerified && (
            <Badge variant="secondary" className="shrink-0">
              Verified
            </Badge>
          )}
        </div>
        {rating && reviewsCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span>({reviewsCount} reviews)</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <div>{address}</div>
            <div className="text-muted-foreground">
              {city}, {state}
            </div>
            {distance !== undefined && (
              <div className="text-blue-600 font-medium text-sm mt-1">
                {formatDistance(distance)} away
              </div>
            )}
          </div>
        </div>

        {phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a
              href={`tel:${phone}`}
              className="hover:text-blue-600 transition-colors"
            >
              {phone}
            </a>
          </div>
        )}

        {website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors truncate"
            >
              {website.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </div>
        )}

        {baitTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {baitTypes.slice(0, 4).map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
            {baitTypes.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{baitTypes.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
