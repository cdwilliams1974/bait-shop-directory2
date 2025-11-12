'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  slug: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  userLocation?: { lat: number; lng: number } | null;
}

export function MapView({ markers, center, zoom = 10, userLocation }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = center
      ? [center.lat, center.lng]
      : markers.length > 0
      ? [markers[0].lat, markers[0].lng]
      : [39.8283, -98.5795];

    const map = L.map(mapContainerRef.current).setView(defaultCenter, zoom);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    markers.forEach((marker) => {
      if (marker.lat && marker.lng) {
        const leafletMarker = L.marker([marker.lat, marker.lng], { icon: defaultIcon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width: 150px;">
              <strong style="font-size: 14px;">${marker.name}</strong><br/>
              <a href="/listing/${marker.slug}" style="color: #2563eb; text-decoration: none; font-size: 13px; margin-top: 4px; display: inline-block;">View Details →</a>
            </div>`
          );
      }
    });

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>Your Location</strong>');
    }

    if (markers.length > 1 || (markers.length > 0 && userLocation)) {
      const bounds = L.latLngBounds(
        markers.map((m) => [m.lat, m.lng])
      );
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers, center, zoom, userLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[500px] rounded-lg border shadow-sm"
      style={{ zIndex: 0 }}
    />
  );
}
