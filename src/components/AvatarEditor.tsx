import { Avatar } from "@/types/game";
import Image from "next/image";
import { useState } from "react";
import AvatarDisplay from "./AvatarDisplay";

interface AvatarEditorProps {
  initialAvatar?: Avatar;
  onSave: (avatar: Avatar) => void;
  onCancel?: () => void;
}

type Category = "hat" | "hair" | "face" | "body";

const categoryOptions = {
  hat: { count: 10, label: "Hat" },
  hair: { count: 10, label: "Hair" },
  face: { count: 10, label: "Face" },
  body: { count: 6, label: "Body" },
};

export default function AvatarEditor({ initialAvatar, onSave, onCancel }: AvatarEditorProps) {
  const [avatar, setAvatar] = useState<Avatar>(initialAvatar || { hat: 0, hair: 0, face: 0, body: 0 });
  const [activeCategory, setActiveCategory] = useState<Category>("hat");

  const updateAvatar = (category: Category, value: number) => {
    setAvatar({ ...avatar, [category]: value });
  };

  const handleSave = () => {
    onSave(avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Customize Your Avatar</h2>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <AvatarDisplay avatar={avatar} size="large" />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 border-b dark:border-gray-700">
          {(Object.keys(categoryOptions) as Category[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeCategory === category
                  ? "border-b-2 border-primary-500 text-primary-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {categoryOptions[category].label}
            </button>
          ))}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Array.from({ length: categoryOptions[activeCategory].count }, (_, i) => (
            <button
              key={i}
              onClick={() => updateAvatar(activeCategory, i)}
              className={`relative aspect-square border-2 rounded-lg transition-all hover:scale-105 ${
                avatar[activeCategory] === i
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-300"
              }`}
            >
              <Image
                src={`/avatars/${activeCategory === "hat" ? "hats" : activeCategory}/${
                  activeCategory === "hat" ? "hat" : activeCategory
                }-${i}.svg`}
                alt={`${categoryOptions[activeCategory].label} option ${i + 1}`}
                width={64}
                height={64}
                className="w-full h-full p-1"
              />
              {avatar[activeCategory] === i && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
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
  );
}
