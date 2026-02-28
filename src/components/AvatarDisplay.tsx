import { Avatar } from "@/types/game";
import Image from "next/image";

interface AvatarDisplayProps {
  avatar?: Avatar;
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeMap = {
  small: 32,
  medium: 64,
  large: 128,
};

export default function AvatarDisplay({ avatar, size = "medium", className = "" }: AvatarDisplayProps) {
  // Default avatar if none provided
  const defaultAvatar: Avatar = { hat: -1, hair: -1, face: 0, skin: 13, body: 0 };
  const displayAvatar = avatar || defaultAvatar;

  const pixelSize = sizeMap[size];
  const hatOffset = Math.round(pixelSize * 0.04);

  return (
    <div className={`relative inline-block ${className}`} style={{ width: pixelSize, height: pixelSize }}>
      {/* Layer 1: Body (bottom layer) */}
      <Image
        src={`/avatars/body/body-${displayAvatar.body}.svg`}
        alt="Avatar body"
        width={pixelSize}
        height={pixelSize}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      />

      {/* Layer 2: Skin */}
      <Image
        src={`/avatars/skin/skin-${displayAvatar.skin}.svg`}
        alt="Avatar skin"
        width={pixelSize}
        height={pixelSize}
        className="absolute inset-0"
        style={{ zIndex: 2 }}
      />

      {/* Layer 3: Face (slightly lighter on darker skins) */}
      <Image
        src={`/avatars/skin-face/skin-face-${displayAvatar.skin}.svg`}
        alt="Avatar face tone"
        width={pixelSize}
        height={pixelSize}
        className="absolute inset-0"
        style={{ zIndex: 3 }}
      />

      {/* Layer 4: Face Features */}
      <Image
        src={`/avatars/face/face-${displayAvatar.face}.svg`}
        alt="Avatar face features"
        width={pixelSize}
        height={pixelSize}
        className="absolute inset-0"
        style={{ zIndex: 4 }}
      />

      {/* Layer 5: Hair */}
      {displayAvatar.hair >= 0 && (
        <Image
          src={`/avatars/hair/hair-${displayAvatar.hair}.svg`}
          alt="Avatar hair"
          width={pixelSize}
          height={pixelSize}
          className="absolute inset-0"
          style={{ zIndex: 5 }}
        />
      )}

      {/* Layer 6: Hat (top layer) */}
      {displayAvatar.hat >= 0 && (
        <Image
          src={`/avatars/hats/hat-${displayAvatar.hat}.svg`}
          alt="Avatar hat"
          width={pixelSize}
          height={pixelSize}
          className="absolute inset-0"
          style={{ zIndex: 6, transform: `translateY(${hatOffset}px)` }}
        />
      )}
    </div>
  );
}
