import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { CHARACTER_SCENES, type CharacterScene } from "../data/characterScenes";
import { envelope, skyAt, W } from "../data/timeline";
import { mix } from "../lib/draw";
import { groundY } from "./Scenery";

// kano.png is cut from the jacket by scripts/cutout.py (625×1295).
const ASPECT = 625 / 1295;

// slow breathing plus a faint sway with the strum
const breathe = (t: number, amp: number) => ({
  transformOrigin: "50% 100%",
  scale: `1 ${1 + Math.sin((t / 3.6) * Math.PI * 2) * 0.005 + amp * 0.004}`,
  rotate: `${Math.sin((t / 5.3) * Math.PI * 2) * 0.45}deg`,
});

// The jacket character, only in the intro and outro, standing where the cover places her.
export const Character: React.FC<{ t: number; amp: number }> = ({ t, amp }) => {
  const { width, height } = useVideoConfig();
  const vis = Math.max(envelope(t, W.character), envelope(t, W.outro));
  if (vis === 0) return null;
  const h = height * 0.86;
  const w = h * ASPECT;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Img
        src={staticFile("kano.png")}
        style={{
          position: "absolute",
          width: w,
          height: h,
          left: width * 0.66 - w / 2,
          top: height * 0.955 - h,
          ...breathe(t, amp),
        }}
      />
    </AbsoluteFill>
  );
};

// "rgba(r, g, b, a)" → [r, g, b] in 0–1
const channels = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map((v) => Number(v) / 255);

const SceneCharacter: React.FC<{ scene: CharacterScene; t: number; amp: number; vis: number }> = ({
  scene,
  t,
  amp,
  vis,
}) => {
  const { width, height } = useVideoConfig();
  const h = height * scene.h;
  const w = h * scene.aspect;
  const cx = width * scene.x;
  // Multiplying by the sky color, so the cream figure sits in rain, dusk and night alike.
  const [r, g, b] = channels(mix("#FFFFFF", skyAt(t).bottom, scene.tint));
  const filterId = `tint-${scene.id}`;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`} />
        </filter>
      </svg>
      <Img
        src={staticFile(`characters/${scene.id}.png`)}
        style={{
          position: "absolute",
          width: w,
          height: h,
          left: cx - w / 2,
          // feet sink a little into the ground line
          top: groundY(cx, height) - h + 6,
          filter: `url(#${filterId})`,
          ...breathe(t, amp),
        }}
      />
    </AbsoluteFill>
  );
};

// Small figures on the horizon through the middle of the song, one pose per section.
export const SceneCharacters: React.FC<{ t: number; amp: number }> = ({ t, amp }) => (
  <>
    {CHARACTER_SCENES.map((scene) => {
      const vis = envelope(t, scene.window);
      return vis === 0 ? null : <SceneCharacter key={scene.id} scene={scene} t={t} amp={amp} vis={vis} />;
    })}
  </>
);
