import type { PlantCareProfile } from '../types/plant';

export const HERO_CONSERVATORY_IMAGE =
  '/src/assets/images/specimen_conservatory_hero_1795373027852.jpg';

export const SAMPLE_SPECIMENS: PlantCareProfile[] = [
  {
    id: 'sample-monstera',
    commonName: 'Swiss Cheese Plant',
    scientificName: 'Monstera deliciosa',
    family: 'Araceae',
    origin: 'Southern Mexico to Panama',
    confidenceLevel: 'High',
    identificationNotes:
      'Distinctive broad, glossy emerald cordate leaves displaying mature pinnate fenestrations and aerial root nodes.',
    summary:
      'A vigorous tropical climbing aroid prized for its architectural split leaves. Thrives indoors when given bright filtered light, chunky aerated soil, and support from a moss pole.',
    imageUrl: '/src/assets/images/specimen_monstera_leaf_1795373028362.jpg',
    environmentNote: 'Indoor bright window',
    wateringIntervalDays: 8,
    careMetrics: {
      light: {
        headline: 'Bright indirect · 400–800 FC',
        detail:
          'Position 3–6 ft from an east- or south-facing window. Direct midday sun scorches foliage; dim corners reduce leaf fenestrations.',
      },
      watering: {
        headline: 'Every 7–10 days',
        detail:
          'Soak thoroughly until water exits drainage holes once the top 2 inches (5 cm) of potting mix feel completely dry.',
      },
      humidityAndTemp: {
        headline: '50–70% RH · 18–27 °C',
        detail:
          'Adapts to normal indoor humidity above 45%, though elevated humidity accelerates unfurling of large split leaves. Keep above 13 °C.',
      },
      soilAndPh: {
        headline: 'Chunky aroid mix · pH 5.5–7.0',
        detail:
          'Blend 50% peat-free potting soil, 25% orchid bark, and 25% coarse perlite or pumice for rapid drainage and root oxygenation.',
      },
      fertilization: {
        headline: 'Balanced 20-20-20 · Monthly',
        detail:
          'Feed at half strength every 3–4 weeks from April through September while new shoots are emerging. Pause feeding in winter.',
      },
      toxicity: {
        status: 'Toxic to Pets & Humans',
        detail:
          'Contains insoluble calcium oxalate crystals. Causes oral irritation and drooling in cats, dogs, and humans if chewed.',
      },
    },
    healthAssessment: {
      status: 'Thriving',
      observations:
        'Leaves show rich chlorophyll density, taut petiole posture, and clean fenestration margins without necrotic spotting or chlorosis.',
      immediateActions: [
        'Wipe broad leaf surfaces with a damp cloth monthly to clear dust and maximize photosynthesis.',
        'Rotate pot a quarter-turn weekly so foliage grows symmetrically toward the window.',
        'Guide developing aerial roots gently toward the potting soil or a damp coco-coir pole.',
      ],
    },
    seasonalCare: {
      springSummer:
        'Active growth window. Increase watering frequency as soil dries faster, mist aerial roots, and repot up one container size only if roots circle the drainage holes.',
      autumnWinter:
        'Growth slows noticeably. Extend watering intervals to 12–16 days, keep away from cold windowpanes or radiator drafts, and withhold fertilizer.',
    },
    troubleshooting: [
      {
        symptom: 'Yellowing lower leaves with damp soil',
        cause: 'Overwatering or compacted mix starving roots of oxygen',
        remedy: 'Allow top 3 inches to dry, inspect roots for dark mushy decay, and refresh with airy bark-perlite mix.',
      },
      {
        symptom: 'New leaves emerge small and unsplit',
        cause: 'Insufficient light intensity or lack of vertical climbing support',
        remedy: 'Move closer to filtered morning sunlight and stake main stem to a vertical moss pole.',
      },
      {
        symptom: 'Crisp brown leaf tips',
        cause: 'Irregular drying cycles, low ambient humidity, or mineral salt buildup',
        remedy: 'Flush pot with filtered or rainwater every two months and maintain consistent watering.',
      },
    ],
    propagationTips:
      'Take a stem cutting just below a node that includes at least one leaf and an aerial root bump. Root in clean water (changing weekly) or damp sphagnum moss until 3-inch secondary roots form.',
    analyzedAt: '2026-11-22T09:00:00.000Z',
  },
  {
    id: 'sample-fiddle',
    commonName: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    family: 'Moraceae',
    origin: 'Western Africa',
    confidenceLevel: 'High',
    identificationNotes:
      'Upright woody trunk supporting broad, violin-shaped leathery foliage with prominent recessed venation and slightly undulating margins.',
    summary:
      'A sculptural indoor tree native to lowland West African rainforests. Prefers consistent high light, draft-free warmth, and disciplined watering schedules without frequent relocation.',
    imageUrl: '/src/assets/images/specimen_fiddle_fig_1795373028607.jpg',
    environmentNote: 'Sunlit interior corner',
    wateringIntervalDays: 10,
    careMetrics: {
      light: {
        headline: 'Bright filtered · 600–1,000 FC',
        detail:
          'Requires strong, consistent light near an unobstructed south- or west-facing window. Filter harsh afternoon glare through sheer curtains.',
      },
      watering: {
        headline: 'Every 8–12 days',
        detail:
          'Water deeply when the top 2–3 inches of soil are dry. Empty saucer runoff promptly after 15 minutes so roots never sit in standing water.',
      },
      humidityAndTemp: {
        headline: '45–60% RH · 18–26 °C',
        detail:
          'Sensitive to sudden temperature swings and cold AC/heating vents. Keep ambient room temperatures steady year-round.',
      },
      soilAndPh: {
        headline: 'Fast-draining loam · pH 6.0–7.0',
        detail:
          'Use a structured indoor tree mix amended with 20% perlite and horticultural charcoal to prevent compaction over multi-year pot stays.',
      },
      fertilization: {
        headline: 'Ficus 3-1-2 liquid · Bi-weekly',
        detail:
          'Apply diluted nitrogen-forward houseplant fertilizer every 2–3 weeks during spring and summer flush periods.',
      },
      toxicity: {
        status: 'Mildly Irritating',
        detail:
          'Milky latex sap inside stems and leaves can irritate skin and cause mild gastrointestinal upset in pets if ingested.',
      },
    },
    healthAssessment: {
      status: 'Thriving',
      observations:
        'Full canopy density with upright petioles, crisp venation, and no lower-leaf abscission or brown edema spots.',
      immediateActions: [
        'Keep the planter in its current sunlit position; avoid moving the tree frequently.',
        'Check moisture at 3 inches depth with a wooden dowel or finger before watering.',
        'Clean large leaves quarterly with lukewarm water to remove indoor dust film.',
      ],
    },
    seasonalCare: {
      springSummer:
        'Prune leggy upper branches above a node in late spring to encourage branching. Wipe sap cleanly and fertilize regularly.',
      autumnWinter:
        'Reduce watering by roughly 30–40%. Monitor for spider mites on leaf undersides when indoor heating dries the air.',
    },
    troubleshooting: [
      {
        symptom: 'Dark brown blotches on lower leaves',
        cause: 'Root rot from waterlogged soil or chronic poor drainage',
        remedy: 'Trim damaged leaves, let rootball dry substantially, and ensure pot has open bottom drainage.',
      },
      {
        symptom: 'Tiny reddish spots on new emerging leaves',
        cause: 'Edema from inconsistent watering cycles (drought followed by flood)',
        remedy: 'Adopt smaller, steadier watering intervals before soil shrinks away from pot walls.',
      },
      {
        symptom: 'Sudden drop of healthy green leaves',
        cause: 'Environmental shock from cold drafts or abrupt relocation',
        remedy: 'Stabilize temperature above 18 °C, maintain light levels, and give 3–4 weeks to acclimate.',
      },
    ],
    propagationTips:
      'Cut a 6-inch healthy semi-hardwood branch tip below a node, remove the lower leaves, rinse away white sap, and root in water or damp perlite under bright indirect light for 4–6 weeks.',
    analyzedAt: '2026-11-22T09:00:00.000Z',
  },
  {
    id: 'sample-lavender',
    commonName: 'English Lavender',
    scientificName: 'Lavandula angustifolia',
    family: 'Lamiaceae',
    origin: 'Western Mediterranean',
    confidenceLevel: 'High',
    identificationNotes:
      'Compact woody perennial subshrub featuring aromatic silvery-gray linear leaves and dense upright violet-purple flower spikes.',
    summary:
      'A drought-tolerant Mediterranean herb celebrated for pollinator appeal and aromatic blooms. Demands full sun, lean gritty soil, and annual post-bloom pruning to stay compact.',
    imageUrl: '/src/assets/images/specimen_lavender_pot_1795373027566.jpg',
    environmentNote: 'Outdoor full sun terrace',
    wateringIntervalDays: 6,
    careMetrics: {
      light: {
        headline: 'Full direct sun · 6–8+ hrs/day',
        detail:
          'Needs maximum outdoor sun exposure for tight foliage, strong essential oil production, and abundant upright flower spikes.',
      },
      watering: {
        headline: 'Every 5–7 days in pots',
        detail:
          'Deeply soak container soil, then allow it to dry almost completely before watering again. Established garden plants rarely need irrigation.',
      },
      humidityAndTemp: {
        headline: '30–50% RH · -10 to 32 °C',
        detail:
          'Hardy to USDA Zones 5–9. Prefers dry, breezy air circulation and struggles in stagnant, high-humidity shade.',
      },
      soilAndPh: {
        headline: 'Lean alkaline grit · pH 6.5–7.5',
        detail:
          'Mix 60% mineral potting mix with 40% coarse builder sand, pumice, or crushed limestone grit. Avoid moisture-retentive compost.',
      },
      fertilization: {
        headline: 'Minimal / Low-nitrogen · Spring',
        detail:
          'Thrives in lean soil. Excess fertilizer produces weak, floppy stems with fewer blooms; a single light compost top-dress in spring suffices.',
      },
      toxicity: {
        status: 'Mildly Irritating',
        detail:
          'Culinary safe in small amounts for humans, though concentrated linalool compounds can cause mild digestive upset in cats and dogs.',
      },
    },
    healthAssessment: {
      status: 'Thriving',
      observations:
        'Dense silvery foliage mounding cleanly above the sandstone trough with uniform flower spike coloration and zero crown rot.',
      immediateActions: [
        'Shear spent flower stalks plus 1–2 inches of green foliage right after peak bloom fades.',
        'Verify the trough drainage holes remain clear ahead of winter rain.',
        'Keep organic bark mulch pulled 2 inches back from the woody crown to keep stems dry.',
      ],
    },
    seasonalCare: {
      springSummer:
        'Deadhead early spikes to encourage a second late-summer flush. Harvest stems for drying when roughly half the buds on the spike have opened.',
      autumnWinter:
        'Elevate container slightly on pot feet for fast rain runoff. Never cut back into bare, leafless old wood during autumn.',
    },
    troubleshooting: [
      {
        symptom: 'Woody, split open center with sparse outer stems',
        cause: 'Skipped annual shearing over multiple growing seasons',
        remedy: 'Trim new green growth back by one-third every year after bloom; avoid cutting old brown bark.',
      },
      {
        symptom: 'Gray mushy stems at the soil line',
        cause: 'Root or crown rot caused by wet, organic-rich soil',
        remedy: 'Repot immediately into porous terracotta or stone with coarse grit and reduce watering.',
      },
      {
        symptom: 'Floppy green shoots with few flowers',
        cause: 'Excessive shade or nitrogen-heavy fertilizer',
        remedy: 'Relocate to full unobstructed sun and stop fertilizing.',
      },
    ],
    propagationTips:
      'Take 3–4 inch non-flowering heel cuttings in late spring or early summer, strip bottom inch of leaves, dip in rooting hormone, and insert into moist 50/50 perlite-peat mix.',
    analyzedAt: '2026-11-22T09:00:00.000Z',
  },
];
