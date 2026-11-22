import { Droplets, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { GardenPlant } from '../types/plant';
import { SpecimenImage } from './SpecimenImage';

interface MyGardenSectionProps {
  gardenPlants: GardenPlant[];
  activePlantId: string;
  onSelectPlant: (plant: GardenPlant) => void;
  onLogWatered: (plantId: string) => void;
  onRemovePlant: (plantId: string) => void;
  onLoadSampleCollection: () => void;
}

type GardenFilter = 'all' | 'due';

function daysSince(isoDate: string): number {
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function MyGardenSection({
  gardenPlants,
  activePlantId,
  onSelectPlant,
  onLogWatered,
  onRemovePlant,
  onLoadSampleCollection,
}: MyGardenSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<GardenFilter>('all');

  const filteredPlants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return gardenPlants.filter((plant) => {
      const elapsed = daysSince(plant.lastWateredAt);
      const isDue = elapsed >= plant.wateringIntervalDays;
      if (filter === 'due' && !isDue) return false;
      if (!q) return true;
      return (
        plant.commonName.toLowerCase().includes(q) ||
        plant.scientificName.toLowerCase().includes(q) ||
        plant.family.toLowerCase().includes(q)
      );
    });
  }, [gardenPlants, searchQuery, filter]);

  return (
    <section id="garden" className="mx-auto max-w-[1280px] px-6 py-10">
      <div className="flex flex-col gap-4 border-b border-[#E2E7E1] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#526056]">
            Personal Collection
          </p>
          <h2 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-[#131D16]">
            My Garden <span className="font-mono text-xl font-normal text-[#526056] tabular-nums">({gardenPlants.length})</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7D8A80]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter plants..."
              aria-label="Filter saved plants"
              className="min-h-[40px] w-56 rounded-lg border border-[#CBD4CA] bg-white pr-3 pl-9 text-sm text-[#131D16] placeholder:text-[#7D8A80]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#EDF2EC] p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`min-h-[32px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#131D16] shadow-xs'
                  : 'text-[#526056] hover:text-[#131D16]'
              }`}
            >
              All Plants
            </button>
            <button
              type="button"
              onClick={() => setFilter('due')}
              className={`min-h-[32px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === 'due'
                  ? 'bg-white text-[#131D16] shadow-xs'
                  : 'text-[#526056] hover:text-[#131D16]'
              }`}
            >
              Watering Due
            </button>
          </div>
        </div>
      </div>

      {gardenPlants.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#CBD4CA] bg-white px-6 py-12 text-center">
          <h3 className="font-serif text-xl font-semibold text-[#131D16]">
            Your garden log is empty
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#526056]">
            Identify any plant from a photograph and save its dossier here to track watering
            schedules and seasonal care tasks.
          </p>
          <button
            type="button"
            onClick={onLoadSampleCollection}
            className="mt-5 inline-flex min-h-[40px] items-center rounded-lg border border-[#CBD4CA] bg-white px-4 py-2 text-sm font-medium text-[#131D16] hover:bg-[#F2F5F2] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Add Reference Specimens
          </button>
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[#E2E7E1] bg-white px-6 py-10 text-center">
          <p className="text-sm text-[#526056]">
            No saved plants match your current filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlants.map((plant) => {
            const elapsed = daysSince(plant.lastWateredAt);
            const remaining = plant.wateringIntervalDays - elapsed;
            const isDue = remaining <= 0;
            const isSelected = plant.id === activePlantId;

            return (
              <article
                key={plant.id}
                className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-colors ${
                  isSelected ? 'border-[#1B5E3A]' : 'border-[#E2E7E1]'
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F2F5F2]">
                  <SpecimenImage
                    src={plant.imageUrl}
                    alt={`${plant.commonName} (${plant.scientificName})`}
                    fallbackTitle={plant.commonName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#526056]">
                      <span>{plant.family}</span>
                      <span className="tabular-nums">
                        Every {plant.wateringIntervalDays}d
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-serif text-xl font-semibold text-[#131D16]">
                      {plant.commonName}
                    </h3>
                    <p className="font-serif text-sm italic text-[#526056]">
                      {plant.scientificName}
                    </p>

                    <div className="mt-3 border-t border-[#E2E7E1] pt-3 text-xs">
                      <span
                        className={`font-medium tabular-nums ${
                          isDue ? 'text-[#B45309]' : 'text-[#15803D]'
                        }`}
                      >
                        {isDue
                          ? `Watering due (${elapsed}d since last soak)`
                          : `Next watering in ${remaining} day${remaining === 1 ? '' : 's'}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectPlant(plant)}
                        className="min-h-[36px] rounded-lg border border-[#CBD4CA] bg-white px-3 py-1.5 text-xs font-medium text-[#131D16] hover:bg-[#F2F5F2] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Open Guide
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogWatered(plant.id)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#EEF4EF] px-3 py-1.5 text-xs font-medium text-[#1B5E3A] hover:bg-[#DFECE1] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Droplets className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>Watered</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemovePlant(plant.id)}
                      aria-label={`Remove ${plant.commonName} from My Garden`}
                      className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#7D8A80] hover:bg-[#FEF6F6] hover:text-[#B91C1C] cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
