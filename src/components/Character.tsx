import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { CHARACTER_SCENES, FEET_SINK, placeScene, shadowMatrix, type CharacterScene } from "../data/characterScenes";
import { envelope, skyAt, W } from "../data/timeline";
import { boilFrame, mix, onThrees } from "../lib/draw";
import { groundPoints, groundY } from "./Scenery";

// kano.png is cut from the jacket by scripts/cutout.py (625×1295).
const ASPECT = 625 / 1295;

// slow breathing plus a faint sway with the strum
const breathe = (t: number, amp: number, origin = "50% 100%") => ({
  transformOrigin: origin,
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
const channels = (color: string) =>
  color
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map((v) => Number(v) / 255);

// Pixels her lines wander each drawing, like the boiling scenery around her.
const BOIL_PX = 3;

const SceneCharacter: React.FC<{
  scene: CharacterScene;
  t: number;
  vis: number;
}> = ({ scene, t, vis }) => {
  const { width, height } = useVideoConfig();
  const { left, top, w, h, origin } = placeScene(scene, width, height, (x) => groundY(x, height));
  // Multiplying by the sky color, so the cream figure sits in rain, dusk and night alike.
  const [r, g, b] = channels(mix("#FFFFFF", skyAt(t).bottom, scene.tint));
  const [a, sb, sc, d] = shadowMatrix(scene.shadow);
  const ground = groundPoints(width, height);
  const groundArea = `M${ground.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}L${width + 20},${height + 20}L-20,${height + 20}Z`;
  const id = scene.id;
  const boil = (
    <>
      <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves={1} seed={boilFrame(t)} />
      <feDisplacementMap in="SourceGraphic" scale={BOIL_PX} />
    </>
  );
  const img = staticFile(`characters/${id}.png`);
  const box = { position: "absolute", width: w, height: h, left, top } as const;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={`tint-${id}`} colorInterpolationFilters="sRGB">
          {boil}
          <feColorMatrix type="matrix" values={`${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`} />
        </filter>
        <filter id={`shadow-${id}`} colorInterpolationFilters="sRGB">
          {boil}
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
      </svg>
      {/* her silhouette laid on the ground, clipped so it never rises into the sky */}
      <AbsoluteFill
        style={{
          clipPath: `path("${groundArea}")`,
          // softens the edge after the squash (filters run before clip-path, so the ground edge stays crisp)
          filter: "blur(1px)",
          opacity: scene.shadow.opacity,
        }}
      >
        <Img
          src={img}
          style={{
            ...box,
            filter: `url(#shadow-${id})`,
            transformOrigin: origin,
            // the image is sunk FEET_SINK into the ground; the shadow starts at the line itself
            transform: `matrix(${a}, ${sb}, ${sc}, ${d}, 0, ${-FEET_SINK})`,
          }}
        />
      </AbsoluteFill>
      {/* breathing steps with the drawings instead of gliding between them */}
      <Img
        src={img}
        style={{
          ...box,
          filter: `url(#tint-${id})`,
          ...breathe(onThrees(t), 0, origin),
        }}
      />
    </AbsoluteFill>
  );
};

// Small figures on the horizon through the middle of the song, one pose per section.
export const SceneCharacters: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CHARACTER_SCENES.map((scene) => {
      const vis = envelope(t, scene.window);
      return vis === 0 ? null : <SceneCharacter key={scene.id} scene={scene} t={t} vis={vis} />;
    })}
  </>
);
