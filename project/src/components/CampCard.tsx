import React from 'react';
import { CampWithCountry } from '../types';
import { MapPin, Calendar, Users } from 'lucide-react';

interface CampCardProps {
  camp: CampWithCountry;
  onClick: () => void;
}

export function CampCard({ camp, onClick }: CampCardProps) {
  const startDate = new Date(camp.start_date);
  const endDate = new Date(camp.end_date);
  const countryName = camp.countries?.name || 'Unknown';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 duration-200"
    >
      <div className="relative">
        {camp.image_url ? (
          <img
            src={camp.image_url}
            alt={camp.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <span className="text-slate-500 text-sm">No image available</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
          <span className="text-sm font-semibold text-slate-900">{countryName}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-900 mb-4">{camp.name}</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">
              {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium capitalize">
              {camp.gender === 'both' ? 'Boys & Girls' : camp.gender}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
