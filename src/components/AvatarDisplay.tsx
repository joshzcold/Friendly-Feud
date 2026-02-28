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
  const defaultAvatar: Avatar = { hat: 0, hair: 0, face: 0, body: 0 };
  const displayAvatar = avatar || defaultAvatar;

  const pixelSize = sizeMap[size];

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

      {/* Layer 2: Face */}
      <Image
        src={`/avatars/face/face-${displayAvatar.face}.svg`}
        alt="Avatar face"
        width={pixelSize}
        height={pixelSize}
        className="absolute inset-0"
        style={{ zIndex: 2 }}
      />

      {/* Layer 3: Hair */}
      <Image
        src={`/avatars/hair/hair-${displayAvatar.hair}.svg`}
        alt="Avatar hair"
        width={pixelSize}
        height={pixelSize}
        className="absolute inset-0"
        style={{ zIndex: 3 }}
      />

      {/* Layer 4: Hat (top layer) */}
      <Image
        src={`/avatars/hats/hat-${displayAvatar.hat}.svg`}
        alt="Avatar hat"
        width={pixelSize}
        height={pixelSize}
        className="absolute inset-0"
        style={{ zIndex: 4 }}
      />
    </div>
  );
}
