import { AlertCircle, Camera, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, RefObject } from 'react';
import { HERO_CONSERVATORY_IMAGE, SAMPLE_SPECIMENS } from '../data/samplePlants';
import type { PlantCareProfile } from '../types/plant';
import { preparePlantImage } from '../utils/image';
import type { PreparedImage } from '../utils/image';
import { SpecimenImage } from './SpecimenImage';

interface PlantUploaderProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onAnalyze: (payload: {
    imageBase64: string;
    mimeType: string;
    environment: string;
    notes: string;
    previewUrl: string;
  }) => void;
  onSelectSample: (plant: PlantCareProfile) => void;
  onDismissError: () => void;
}

const ENVIRONMENT_OPTIONS = [
  'Indoor Bright Window',
  'Indoor Low / Indirect Light',
  'Covered Patio / Balcony',
  'Outdoor Full Sun',
  'Outdoor Partial Shade',
  'Greenhouse / Conservatory',
];

export function PlantUploader({
  fileInputRef,
  isAnalyzing,
  errorMessage,
  onAnalyze,
  onSelectSample,
  onDismissError,
}: PlantUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<PreparedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [environment, setEnvironment] = useState(ENVIRONMENT_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileSelection(file: File | undefined) {
    if (!file) return;
    setLocalError(null);
    onDismissError();
    try {
      const prepared = await preparePlantImage(file);
      setSelectedImage(prepared);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to load image.');
    }
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFileSelection(e.target.files?.[0]);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files?.[0]);
  }

  function handleSubmit() {
    if (!selectedImage || isAnalyzing) return;
    onAnalyze({
      imageBase64: selectedImage.base64,
      mimeType: selectedImage.mimeType,
      environment,
      notes,
      previewUrl: selectedImage.dataUrl,
    });
  }

  const activeError = errorMessage || localError;

  return (
    <section id="identify" className="mx-auto max-w-[1280px] px-6 pt-10 pb-12">
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Left Column: Upload & Context Controls */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#526056]">
              Botanical Identification &amp; Diagnostics
            </p>
            <h1 className="mt-2.5 max-w-2xl font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-[#131D16] [text-wrap:balance] sm:text-5xl">
              Identify any plant and get tailored care
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#435147]">
              Upload a clear photograph of leaves, stems, or blooms. Folia identifies the species,
              evaluates visible plant health, and builds a practical care schedule for your space.
            </p>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`mt-6 rounded-xl border border-dashed p-6 transition-colors duration-150 ${
                isDragging
                  ? 'border-[#1B5E3A] bg-[#EEF4EF]'
                  : 'border-[#CBD4CA] bg-white hover:border-[#7B917E]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="sr-only"
                aria-label="Upload plant photo"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
                className="sr-only"
                aria-label="Capture plant photo with camera"
              />

              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F2F5F2] text-[#1B5E3A]">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#131D16]">
                      {selectedImage ? selectedImage.fileName : 'Drop a plant photograph here'}
                    </p>
                    <p className="mt-0.5 text-xs text-[#526056]">
                      {selectedImage
                        ? `${selectedImage.width} × ${selectedImage.height} px · Ready for botanical analysis`
                        : 'JPG, PNG, or WebP · Natural daylight works best'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#CBD4CA] bg-white px-4 py-2 text-sm font-medium text-[#131D16] transition-colors duration-150 hover:bg-[#F2F5F2] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Choose Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#CBD4CA] bg-white px-4 py-2 text-sm font-medium text-[#131D16] transition-colors duration-150 hover:bg-[#F2F5F2] whitespace-nowrap shrink-0 cursor-pointer sm:hidden"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    <span>Camera</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Growing Context Inputs */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="plant-environment"
                  className="block text-xs font-medium text-[#435147]"
                >
                  Growing Environment
                </label>
                <select
                  id="plant-environment"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#CBD4CA] bg-white px-3 py-2 text-sm text-[#131D16]"
                >
                  {ENVIRONMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="plant-notes"
                  className="block text-xs font-medium text-[#435147]"
                >
                  Symptoms or Notes (Optional)
                </label>
                <input
                  id="plant-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., yellowing lower leaves, dry tips"
                  className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#CBD4CA] bg-white px-3 py-2 text-sm text-[#131D16] placeholder:text-[#7D8A80]"
                />
              </div>
            </div>

            {activeError && (
              <div
                role="alert"
                className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-[#F3C6C6] bg-[#FEF6F6] px-4 py-3 text-sm text-[#991B1B]"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{activeError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    onDismissError();
                  }}
                  aria-label="Dismiss error"
                  className="rounded p-1 hover:bg-[#FBE8E8] cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={!selectedImage || isAnalyzing}
                onClick={handleSubmit}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#1B5E3A] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#14482C] disabled:cursor-not-allowed disabled:bg-[#CBD4CA] disabled:text-[#526056] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Analyzing Specimen...</span>
                  </>
                ) : (
                  <span>Identify &amp; Diagnose</span>
                )}
              </button>

              {selectedImage && !isAnalyzing && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="min-h-[44px] px-3 py-2 text-sm font-medium text-[#526056] hover:text-[#131D16] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Clear Photo
                </button>
              )}
            </div>
          </div>

          {/* Sample Specimen Bar */}
          <div className="mt-8 border-t border-[#E2E7E1] pt-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#526056]">
              <span className="font-medium text-[#435147]">Inspect reference guides:</span>
              {SAMPLE_SPECIMENS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  className="font-medium text-[#1B5E3A] underline decoration-[#CBD4CA] underline-offset-4 transition-colors hover:decoration-[#1B5E3A] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {sample.commonName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Specimen Preview */}
        <div className="lg:col-span-5">
          <div className="relative h-full min-h-[340px] overflow-hidden rounded-xl border border-[#E2E7E1] bg-[#F2F5F2]">
            <SpecimenImage
              src={selectedImage ? selectedImage.dataUrl : HERO_CONSERVATORY_IMAGE}
              alt={
                selectedImage
                  ? 'Uploaded plant specimen preview'
                  : 'Sunlit conservatory potting bench with indoor plants and brass watering can'
              }
              fallbackTitle={selectedImage ? 'Selected Specimen' : 'Folia Conservatory'}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
              <p className="text-xs font-medium tracking-wide text-white/80">
                {selectedImage ? 'Specimen Queued for Analysis' : 'Field Guide Preview'}
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {selectedImage
                  ? `${environment}${notes.trim() ? ` · ${notes.trim()}` : ''}`
                  : 'Upload foliage, bark, or flowers to receive taxonomy, watering cadence, soil ratios, and health diagnostics.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
