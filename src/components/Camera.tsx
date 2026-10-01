import { AbsoluteFill } from "remotion";
import { CAMERA_ORIGIN, cameraAt } from "../data/camera";

// The wide shot's world, scaled by the slow push-ins. Lyrics, titles and the paper stay outside it.
export const Camera: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => (
  <AbsoluteFill
    style={{
      transformOrigin: `${CAMERA_ORIGIN[0] * 100}% ${CAMERA_ORIGIN[1] * 100}%`,
      scale: String(cameraAt(t).scale),
    }}
  >
    {children}
  </AbsoluteFill>
);
