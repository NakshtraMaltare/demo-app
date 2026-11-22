/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { BotanistChat } from './components/BotanistChat';
import { Header } from './components/Header';
import type { NavSection } from './components/Header';
import { MyGardenSection } from './components/MyGardenSection';
import { PlantCareDossier } from './components/PlantCareDossier';
import { PlantUploader } from './components/PlantUploader';
import { SAMPLE_SPECIMENS } from './data/samplePlants';
import type { ChatMessage, ChatMode, GardenPlant, PlantCareProfile } from './types/plant';
import { identifyPlantPhoto, sendBotanistMessage } from './utils/api';

const GARDEN_STORAGE_KEY = 'folia_garden_specimens_v1';

function buildInitialGarden(): GardenPlant[] {
  try {
    const raw = localStorage.getItem(GARDEN_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as GardenPlant[];
    }
  } catch {
    // Fallback to initial reference specimens if storage is unavailable
  }

  const now = Date.now();
  return [
    {
      ...SAMPLE_SPECIMENS[0],
      savedAt: new Date(now - 1000 * 60 * 60 * 24 * 6).toISOString(),
      lastWateredAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      completedActions: [],
    },
    {
      ...SAMPLE_SPECIMENS[2],
      savedAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
      lastWateredAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
      completedActions: [],
    },
  ];
}

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('identify');
  const [activePlant, setActivePlant] = useState<PlantCareProfile>(SAMPLE_SPECIMENS[0]);
  const [gardenPlants, setGardenPlants] = useState<GardenPlant[]>(() => buildInitialGarden());
  const [transientCompletedActions, setTransientCompletedActions] = useState<
    Record<string, string[]>
  >({});

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [identifyError, setIdentifyError] = useState<string | null>(null);

  const [chatPlantContext, setChatPlantContext] = useState<PlantCareProfile | null>(
    SAMPLE_SPECIMENS[0]
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>('thorough');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(gardenPlants));
    } catch {
      // Ignore quota errors if very large images are saved
    }
  }, [gardenPlants]);

  function scrollToSection(section: NavSection) {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleQuickScan() {
    scrollToSection('identify');
    window.setTimeout(() => {
      fileInputRef.current?.click();
    }, 150);
  }

  async function handleAnalyze(payload: {
    imageBase64: string;
    mimeType: string;
    environment: string;
    notes: string;
    previewUrl: string;
  }) {
    setIsAnalyzing(true);
    setIdentifyError(null);
    try {
      const identified = await identifyPlantPhoto(payload);
      setActivePlant(identified);
      setChatPlantContext(identified);
      scrollToSection('guide');
    } catch (err) {
      setIdentifyError(
        err instanceof Error ? err.message : 'Unable to identify plant from this photo.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleSelectSample(sample: PlantCareProfile) {
    setIdentifyError(null);
    setActivePlant(sample);
    setChatPlantContext(sample);
    scrollToSection('guide');
  }

  const savedMatch = gardenPlants.find((item) => item.id === activePlant.id);
  const completedActions =
    savedMatch?.completedActions ?? transientCompletedActions[activePlant.id] ?? [];

  function handleToggleSave(plant: PlantCareProfile) {
    const exists = gardenPlants.some((item) => item.id === plant.id);
    if (exists) {
      setGardenPlants((prev) => prev.filter((item) => item.id !== plant.id));
      return;
    }

    const nowIso = new Date().toISOString();
    const newEntry: GardenPlant = {
      ...plant,
      savedAt: nowIso,
      lastWateredAt: nowIso,
      completedActions: transientCompletedActions[plant.id] ?? [],
    };
    setGardenPlants((prev) => [newEntry, ...prev]);
  }

  function handleToggleAction(actionText: string) {
    if (savedMatch) {
      setGardenPlants((prev) =>
        prev.map((item) => {
          if (item.id !== activePlant.id) return item;
          const exists = item.completedActions.includes(actionText);
          return {
            ...item,
            completedActions: exists
              ? item.completedActions.filter((a) => a !== actionText)
              : [...item.completedActions, actionText],
          };
        })
      );
      return;
    }

    setTransientCompletedActions((prev) => {
      const current = prev[activePlant.id] ?? [];
      const exists = current.includes(actionText);
      return {
        ...prev,
        [activePlant.id]: exists
          ? current.filter((a) => a !== actionText)
          : [...current, actionText],
      };
    });
  }

  function handleLogWatered(plantId: string) {
    const nowIso = new Date().toISOString();
    setGardenPlants((prev) =>
      prev.map((item) =>
        item.id === plantId ? { ...item, lastWateredAt: nowIso } : item
      )
    );
  }

  function handleRemovePlant(plantId: string) {
    setGardenPlants((prev) => prev.filter((item) => item.id !== plantId));
  }

  function handleLoadSampleCollection() {
    const now = Date.now();
    const additions: GardenPlant[] = SAMPLE_SPECIMENS.map((sample, index) => ({
      ...sample,
      savedAt: new Date(now - index * 86400000).toISOString(),
      lastWateredAt: new Date(now - (index + 2) * 86400000).toISOString(),
      completedActions: [],
    }));
    setGardenPlants(additions);
  }

  function handleAskBotanist(plant: PlantCareProfile) {
    setChatPlantContext(plant);
    scrollToSection('chat');
  }

  async function handleSendChatMessage(payload: {
    text: string;
    imageBase64?: string;
    mimeType?: string;
    previewUrl?: string;
  }) {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      text: payload.text,
      imageUrl: payload.previewUrl,
      timestamp: new Date().toISOString(),
    };

    const historySnapshot = [...chatMessages];
    setChatMessages((prev) => [...prev, userMsg]);
    setIsSendingChat(true);
    setChatError(null);

    try {
      const result = await sendBotanistMessage({
        history: historySnapshot,
        message: payload.text,
        mode: chatMode,
        activePlant: chatPlantContext,
        imageBase64: payload.imageBase64,
        mimeType: payload.mimeType,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-model-${Date.now()}`,
        role: 'model',
        text: result.reply,
        timestamp: new Date().toISOString(),
        modelLabel: result.modelUsed,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setChatError(
        err instanceof Error ? err.message : 'Unable to send message to the botanist.'
      );
    } finally {
      setIsSendingChat(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#131D16]">
      <Header
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onQuickScan={handleQuickScan}
      />

      <main>
        <PlantUploader
          fileInputRef={fileInputRef}
          isAnalyzing={isAnalyzing}
          errorMessage={identifyError}
          onAnalyze={handleAnalyze}
          onSelectSample={handleSelectSample}
          onDismissError={() => setIdentifyError(null)}
        />

        <PlantCareDossier
          plant={activePlant}
          isSaved={Boolean(savedMatch)}
          completedActions={completedActions}
          onToggleSave={handleToggleSave}
          onToggleAction={handleToggleAction}
          onAskBotanist={handleAskBotanist}
        />

        <MyGardenSection
          gardenPlants={gardenPlants}
          activePlantId={activePlant.id}
          onSelectPlant={(plant) => {
            setActivePlant(plant);
            setChatPlantContext(plant);
            scrollToSection('guide');
          }}
          onLogWatered={handleLogWatered}
          onRemovePlant={handleRemovePlant}
          onLoadSampleCollection={handleLoadSampleCollection}
        />

        <BotanistChat
          messages={chatMessages}
          activePlant={chatPlantContext}
          chatMode={chatMode}
          isSending={isSendingChat}
          errorMessage={chatError}
          onChangeMode={setChatMode}
          onClearContext={() => setChatPlantContext(null)}
          onResetChat={() => {
            setChatMessages([]);
            setChatError(null);
          }}
          onSendMessage={handleSendChatMessage}
        />
      </main>

      <footer className="border-t border-[#E2E7E1] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-4 px-6 py-6 text-xs text-[#526056] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="font-serif text-base font-semibold text-[#131D16]">Folia</span>
            <span aria-hidden="true">·</span>
            <span>Botanical Identification &amp; Care Guide</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => scrollToSection('identify')}
              className="hover:text-[#131D16] cursor-pointer"
            >
              Identify
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('guide')}
              className="hover:text-[#131D16] cursor-pointer"
            >
              Care Guide
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('garden')}
              className="hover:text-[#131D16] cursor-pointer"
            >
              My Garden
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('chat')}
              className="hover:text-[#131D16] cursor-pointer"
            >
              Botanist Chat
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
