import { Avatar } from "@/types/game";
import Image from "next/image";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import AvatarDisplay from "./AvatarDisplay";

interface AvatarEditorProps {
  initialAvatar?: Avatar;
  onSave: (avatar: Avatar) => void;
  onCancel?: () => void;
}

type Category = "hat" | "hair" | "face" | "skin" | "body";

const categoryOptions = {
  hat: { count: 12, label: "Hat" },
  hair: { count: 10, label: "Hair" },
  face: { count: 10, label: "Face" },
  skin: { count: 15, label: "Skin" },
  body: { count: 6, label: "Body" },
};

export default function AvatarEditor({ initialAvatar, onSave, onCancel }: AvatarEditorProps) {
  const [avatar, setAvatar] = useState<Avatar>(initialAvatar || { hat: -1, hair: -1, face: 0, skin: 13, body: 0 });
  const [activeCategory, setActiveCategory] = useState<Category>("hat");
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const categories: Category[] = ["hat", "hair", "face", "skin", "body"];
  const swipeCategories: Category[] = ["hat", "hair", "face", "body"];
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const pointerActive = useRef(false);
  const pointerZone = useRef<Category | null>(null);
  const [activeSwipeZone, setActiveSwipeZone] = useState<Category | null>(null);
  const [showSkinPicker, setShowSkinPicker] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<Category>("hat");
  const [showMobilePicker, setShowMobilePicker] = useState(false);

  const updateAvatar = (category: Category, value: number) => {
    setAvatar({ ...avatar, [category]: value });
  };

  const handleOptionSelect = (category: Category, value: number) => {
    setAvatar({ ...avatar, [category]: value });
    if (category === "skin") {
      setShowSkinPicker(false);
    }
    setShowMobilePicker(false);
  };

  const randomizeAvatar = () => {
    const randomInRange = (max: number) => Math.floor(Math.random() * max);

    setAvatar({
      hat: Math.random() < 0.3 ? -1 : randomInRange(categoryOptions.hat.count),
      hair: Math.random() < 0.3 ? -1 : randomInRange(categoryOptions.hair.count),
      face: randomInRange(categoryOptions.face.count),
      skin: randomInRange(categoryOptions.skin.count),
      body: randomInRange(categoryOptions.body.count),
    });
  };

  const scrollToCategory = (category: Category) => {
    const container = carouselRef.current;
    if (!container) return;
    const index = categories.indexOf(category);
    if (index < 0) return;
    container.scrollTo({ left: container.clientWidth * index, behavior: "smooth" });
    setActiveCategory(category);
  };

  const handleCarouselScroll = () => {
    const container = carouselRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    const nextCategory = categories[index] || categories[0];
    if (nextCategory !== activeCategory) {
      setActiveCategory(nextCategory);
    }
  };

  const goToPreviousCategory = () => {
    const index = categories.indexOf(activeCategory);
    const previousCategory = categories[(index - 1 + categories.length) % categories.length];
    scrollToCategory(previousCategory);
  };

  const goToNextCategory = () => {
    const index = categories.indexOf(activeCategory);
    const nextCategory = categories[(index + 1) % categories.length];
    scrollToCategory(nextCategory);
  };

  const getZoneCategory = (clientY: number, rect: DOMRect) => {
    const relativeY = (clientY - rect.top) / rect.height;
    const index = Math.min(swipeCategories.length - 1, Math.max(0, Math.floor(relativeY * swipeCategories.length)));
    return swipeCategories[index];
  };

  const getCycleValues = (category: Category) => {
    const values = Array.from({ length: categoryOptions[category].count }, (_, i) => i);
    if (category === "hat" || category === "hair") {
      return [-1, ...values];
    }
    return values;
  };

  const getNextValue = (category: Category, current: number) => {
    const values = getCycleValues(category);
    const index = Math.max(0, values.indexOf(current));
    return values[(index + 1) % values.length];
  };

  const getPreviousValue = (category: Category, current: number) => {
    const values = getCycleValues(category);
    const index = Math.max(0, values.indexOf(current));
    return values[(index - 1 + values.length) % values.length];
  };

  const getAssetPath = (category: Category, value: number) => {
    const folder = category === "hat" ? "hats" : category;
    const name = category === "hat" ? "hat" : category;
    return `/avatars/${folder}/${name}-${value}.svg`;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerActive.current = true;
    pointerStartX.current = event.clientX;
    pointerStartY.current = event.clientY;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerZone.current = getZoneCategory(event.clientY, rect);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerActive.current) return;
    pointerActive.current = false;

    const deltaX = event.clientX - pointerStartX.current;
    const deltaY = event.clientY - pointerStartY.current;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    const category = pointerZone.current;
    if (!category) return;

    const nextValue =
      deltaX < 0 ? getNextValue(category, avatar[category]) : getPreviousValue(category, avatar[category]);
    setAvatar({ ...avatar, [category]: nextValue });
    setActiveSwipeZone(category);
    window.setTimeout(() => {
      setActiveSwipeZone(null);
    }, 180);
  };

  const renderOptionsGrid = (category: Category, showLabel = false) => (
    <div className="space-y-2">
      {showLabel && (
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{categoryOptions[category].label}</div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {(category === "hat" || category === "hair") && (
          <button
            key={`${category}-none`}
            onClick={() => handleOptionSelect(category, -1)}
            aria-pressed={avatar[category] === -1}
            className={`relative aspect-square border-2 rounded-lg transition-transform active:scale-95 ${
              avatar[category] === -1
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300"
                : "border-gray-300 dark:border-gray-600 hover:border-primary-300"
            }`}
          >
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-300">
              None
            </div>
            {avatar[category] === -1 && <div className="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full" />}
          </button>
        )}
        {Array.from({ length: categoryOptions[category].count }, (_, i) => (
          <button
            key={i}
            onClick={() => handleOptionSelect(category, i)}
            aria-pressed={avatar[category] === i}
            className={`relative aspect-square border-2 rounded-lg transition-transform active:scale-95 ${
              avatar[category] === i
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300"
                : "border-gray-300 dark:border-gray-600 hover:border-primary-300"
            }`}
          >
            <Image
              src={getAssetPath(category, i)}
              alt={`${categoryOptions[category].label} option ${i + 1}`}
              width={64}
              height={64}
              className="w-full h-full p-1"
            />
            {avatar[category] === i && <div className="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full" />}
          </button>
        ))}
      </div>
    </div>
  );

  const handleSave = () => {
    onSave(avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-lg shadow-xl p-4 md:p-6 max-w-2xl w-full mx-0 md:mx-4 h-[92vh] md:h-auto max-h-[92vh] md:max-h-[90vh] overflow-y-auto md:overflow-visible flex flex-col">
        <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700 md:hidden" />
        <h2 className="text-2xl font-bold mb-0 md:mb-6 text-center dark:text-white">Customize Your Avatar</h2>

        <div className="flex flex-1 flex-col min-h-0">
          {/* Avatar Preview */}
          <div className="flex flex-1 flex-col items-center">
            <div className="relative z-0 flex w-full flex-[7] items-center justify-center overflow-visible">
              <div
                className="relative rounded-full p-2 transition-transform scale-[3.2] sm:scale-[4] md:scale-100 active:scale-[3.1] sm:active:scale-[3.5] md:active:scale-[0.98]"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => {
                  pointerActive.current = false;
                  pointerZone.current = null;
                }}
              >
                <AvatarDisplay avatar={avatar} size="large" />
                <div className="absolute inset-0 pointer-events-none md:hidden">
                  {activeSwipeZone && (
                    <div className="absolute left-1/2 top-[-1.5rem] -translate-x-1/2 rounded-full bg-gray-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                      {categoryOptions[activeSwipeZone].label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  setShowSkinPicker((prev) => !prev);
                  setShowMobilePicker(false);
                }}
                className={`relative z-10 flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm transition-colors ${
                  showSkinPicker
                    ? "border-primary-200 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white/90 text-gray-700"
                }`}
              >
                <span>Skin</span>
                <Image
                  src={getAssetPath("skin", avatar.skin)}
                  alt="Selected skin tone"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </button>
              {(["hat", "hair", "face", "body"] as Category[]).map((category) => (
                <button
                  key={`${category}-mobile-button`}
                  onClick={() => {
                    setMobileCategory(category);
                    setShowMobilePicker((prev) => (mobileCategory === category ? !prev : true));
                    setShowSkinPicker(false);
                  }}
                  className={`relative z-10 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm transition-colors ${
                    mobileCategory === category && showMobilePicker
                      ? "border-primary-200 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white/90 text-gray-700"
                  }`}
                >
                  <span>{categoryOptions[category].label}</span>
                  {avatar[category] === -1 ? (
                    <span className="text-[10px] font-semibold text-gray-500">None</span>
                  ) : (
                    <Image
                      src={getAssetPath(category, avatar[category])}
                      alt={`${categoryOptions[category].label} selected`}
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  )}
                </button>
              ))}
            </div>
            <div
              className={`w-full ${
                showMobilePicker
                  ? "max-h-[380px] opacity-100 scale-100"
                  : "max-h-0 opacity-0 scale-95 pointer-events-none"
              } transition-all duration-200 ease-out origin-top`}
            >
              <div className="relative z-10 w-full overflow-hidden rounded-xl border border-primary-100 bg-white/95">
                <div className="relative max-h-[300px] overflow-y-auto p-3">
                  {renderOptionsGrid(mobileCategory)}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-white/95" />
                </div>
              </div>
            </div>
            <div
              className={`relative z-10 w-full overflow-hidden origin-top rounded-xl transition-all duration-200 ease-out ${
                showSkinPicker
                  ? "max-h-64 opacity-100 scale-100 border border-primary-100 bg-white/90"
                  : "max-h-0 opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div className="relative max-h-64 overflow-y-auto pr-1">
                {renderOptionsGrid("skin")}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-white/90 dark:to-gray-800/90" />
              </div>
              <div className="pt-2 text-center text-[10px] uppercase tracking-wide text-gray-500">Scroll for more</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex flex-wrap gap-3 justify-between">
            <button
              onClick={randomizeAvatar}
              className="px-4 py-2 rounded-lg border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              Randomize
            </button>
            <div className="flex flex-wrap gap-3 justify-end">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Save Avatar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
