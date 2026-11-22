import {
  AlertOctagon,
  AlertTriangle,
  BookmarkCheck,
  BookmarkPlus,
  CheckCircle2,
  Droplets,
  FlaskConical,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Sun,
  Thermometer,
} from 'lucide-react';
import type { PlantCareProfile } from '../types/plant';
import { SpecimenImage } from './SpecimenImage';

interface PlantCareDossierProps {
  plant: PlantCareProfile;
  isSaved: boolean;
  completedActions: string[];
  onToggleSave: (plant: PlantCareProfile) => void;
  onToggleAction: (actionText: string) => void;
  onAskBotanist: (plant: PlantCareProfile) => void;
}

export function PlantCareDossier({
  plant,
  isSaved,
  completedActions,
  onToggleSave,
  onToggleAction,
  onAskBotanist,
}: PlantCareDossierProps) {
  const healthStatus = plant.healthAssessment.status;
  const toxicityStatus = plant.careMetrics.toxicity.status;

  function renderHealthIndicator() {
    if (healthStatus === 'Thriving') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#15803D]">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Health: Thriving</span>
        </span>
      );
    }
    if (healthStatus === 'Needs Attention') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B45309]">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Health: Needs Attention</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B91C1C]">
        <AlertOctagon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Health: Stressed</span>
      </span>
    );
  }

  function renderToxicityIcon() {
    if (toxicityStatus === 'Pet Safe') {
      return <ShieldCheck className="h-4 w-4 text-[#15803D] shrink-0" aria-hidden="true" />;
    }
    if (toxicityStatus === 'Mildly Irritating') {
      return <AlertTriangle className="h-4 w-4 text-[#B45309] shrink-0" aria-hidden="true" />;
    }
    return <ShieldAlert className="h-4 w-4 text-[#B91C1C] shrink-0" aria-hidden="true" />;
  }

  const formattedDate = new Date(plant.analyzedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section id="guide" className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="overflow-hidden rounded-xl border border-[#E2E7E1] bg-white">
        {/* Specimen Header */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:items-center lg:p-8">
          <div className="lg:col-span-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-[#E2E7E1] bg-[#F2F5F2]">
              <SpecimenImage
                src={plant.imageUrl}
                alt={`${plant.commonName} (${plant.scientificName})`}
                fallbackTitle={plant.commonName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#526056]">
              <span>Family {plant.family}</span>
              <span aria-hidden="true">·</span>
              <span>Native to {plant.origin}</span>
              <span aria-hidden="true">·</span>
              <span>ID Confidence: {plant.confidenceLevel}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formattedDate}</span>
            </div>

            <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#131D16] sm:text-4xl">
                  {plant.commonName}
                </h2>
                <p className="mt-1 font-serif text-lg italic text-[#435147]">
                  {plant.scientificName}
                </p>
              </div>
              <div className="shrink-0">{renderHealthIndicator()}</div>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#435147] sm:text-base">
              {plant.summary}
            </p>
            <p className="mt-2.5 text-xs leading-relaxed text-[#526056]">
              <span className="font-semibold text-[#131D16]">Visual ID cues: </span>
              {plant.identificationNotes}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleSave(plant)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isSaved
                    ? 'border border-[#1B5E3A] bg-[#EEF4EF] text-[#1B5E3A]'
                    : 'bg-[#1B5E3A] text-white hover:bg-[#14482C]'
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Saved in My Garden</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Save to My Garden</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onAskBotanist(plant)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#CBD4CA] bg-white px-4 py-2 text-sm font-medium text-[#131D16] transition-colors duration-150 hover:bg-[#F2F5F2] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquareText className="h-4 w-4 text-[#1B5E3A] shrink-0" aria-hidden="true" />
                <span>Ask Botanist About This Plant</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6-Metric Hairline Care Matrix */}
        <div className="grid grid-cols-1 border-t border-[#E2E7E1] md:grid-cols-2 lg:grid-cols-3">
          <div className="border-b border-[#E2E7E1] p-6 md:border-r">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#526056]">
              <Sun className="h-4 w-4 text-[#1B5E3A] shrink-0" aria-hidden="true" />
              <span>Light Exposure</span>
            </div>
            <p className="mt-2 font-mono text-sm font-medium text-[#131D16] tabular-nums">
              {plant.careMetrics.light.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#435147]">
              {plant.careMetrics.light.detail}
            </p>
          </div>

          <div className="border-b border-[#E2E7E1] p-6 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#526056]">
              <Droplets className="h-4 w-4 text-[#1B5E3A] shrink-0" aria-hidden="true" />
              <span>Watering Cadence</span>
            </div>
            <p className="mt-2 font-mono text-sm font-medium text-[#131D16] tabular-nums">
              {plant.careMetrics.watering.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#435147]">
              {plant.careMetrics.watering.detail}
            </p>
          </div>

          <div className="border-b border-[#E2E7E1] p-6 md:border-r lg:border-r-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#526056]">
              <Thermometer className="h-4 w-4 text-[#1B5E3A] shrink-0" aria-hidden="true" />
              <span>Humidity &amp; Temperature</span>
            </div>
            <p className="mt-2 font-mono text-sm font-medium text-[#131D16] tabular-nums">
              {plant.careMetrics.humidityAndTemp.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#435147]">
              {plant.careMetrics.humidityAndTemp.detail}
            </p>
          </div>

          <div className="border-b border-[#E2E7E1] p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#526056]">
              <Sprout className="h-4 w-4 text-[#1B5E3A] shrink-0" aria-hidden="true" />
              <span>Soil Mix &amp; pH</span>
            </div>
            <p className="mt-2 font-mono text-sm font-medium text-[#131D16] tabular-nums">
              {plant.careMetrics.soilAndPh.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#435147]">
              {plant.careMetrics.soilAndPh.detail}
            </p>
          </div>

          <div className="border-b border-[#E2E7E1] p-6 md:border-b-0 md:border-r">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#526056]">
              <FlaskConical className="h-4 w-4 text-[#1B5E3A] shrink-0" aria-hidden="true" />
              <span>Fertilization</span>
            </div>
            <p className="mt-2 font-mono text-sm font-medium text-[#131D16] tabular-nums">
              {plant.careMetrics.fertilization.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#435147]">
              {plant.careMetrics.fertilization.detail}
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#526056]">
              {renderToxicityIcon()}
              <span>Pet &amp; Household Safety</span>
            </div>
            <p className="mt-2 font-mono text-sm font-medium text-[#131D16]">
              {plant.careMetrics.toxicity.status}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#435147]">
              {plant.careMetrics.toxicity.detail}
            </p>
          </div>
        </div>

        {/* Health Diagnosis, Checklist, Seasonal & Propagation */}
        <div className="grid grid-cols-1 border-t border-[#E2E7E1] lg:grid-cols-12">
          <div className="border-b border-[#E2E7E1] p-6 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-8">
            <h3 className="font-serif text-xl font-semibold text-[#131D16]">
              Photo Health Assessment &amp; Care Checklist
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[#435147]">
              {plant.healthAssessment.observations}
            </p>

            <div className="mt-5 divide-y divide-[#E2E7E1] border-t border-b border-[#E2E7E1]">
              {plant.healthAssessment.immediateActions.map((action, idx) => {
                const checked = completedActions.includes(action);
                return (
                  <label
                    key={`${idx}-${action.slice(0, 16)}`}
                    className="flex cursor-pointer items-start gap-3 py-3 text-sm text-[#131D16]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleAction(action)}
                      className="mt-0.5 h-4 w-4 rounded border-[#CBD4CA] accent-[#1B5E3A] cursor-pointer"
                    />
                    <span className={checked ? 'line-through text-[#7D8A80]' : 'text-[#131D16]'}>
                      {action}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-6 lg:col-span-5 lg:p-8">
            <h3 className="font-serif text-xl font-semibold text-[#131D16]">
              Seasonal Schedule &amp; Propagation
            </h3>

            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[#1B5E3A]">
                  Spring &amp; Summer Growth
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#435147]">
                  {plant.seasonalCare.springSummer}
                </dd>
              </div>
              <div className="border-t border-[#E2E7E1] pt-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[#526056]">
                  Autumn &amp; Winter Rest
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#435147]">
                  {plant.seasonalCare.autumnWinter}
                </dd>
              </div>
              <div className="border-t border-[#E2E7E1] pt-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[#526056]">
                  Propagation Method
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#435147]">
                  {plant.propagationTips}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Troubleshooting Reference */}
        {plant.troubleshooting.length > 0 && (
          <div className="border-t border-[#E2E7E1] bg-[#FAFBF9] p-6 lg:p-8">
            <h3 className="font-serif text-xl font-semibold text-[#131D16]">
              Common Issues &amp; Troubleshooting
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E7E1] text-xs font-medium uppercase tracking-wider text-[#526056]">
                    <th className="py-2.5 pr-4">Symptom</th>
                    <th className="py-2.5 px-4">Likely Cause</th>
                    <th className="py-2.5 pl-4">Recommended Remedy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E7E1]">
                  {plant.troubleshooting.map((row, idx) => (
                    <tr key={`${idx}-${row.symptom.slice(0, 14)}`}>
                      <td className="py-3 pr-4 font-medium text-[#131D16] align-top">
                        {row.symptom}
                      </td>
                      <td className="py-3 px-4 text-[#435147] align-top">{row.cause}</td>
                      <td className="py-3 pl-4 text-[#131D16] align-top">{row.remedy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
