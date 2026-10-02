import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import {
  CHARACTER_SCENES,
  FEET_SINK,
  kimiAt,
  placeCompanion,
  placeScene,
  shadowMatrix,
  type CharacterScene,
  type Shadow,
} from "../data/characterScenes";
import { CLOSE_UPS, closeUpCover, closeUpPush, type CloseUp } from "../data/camera";
import { envelope, skyAt, W } from "../data/timeline";
import { boilFrame, mix, onThrees, ramp } from "../lib/draw";
import { erasePolygons, revealPolygons, toClipPath } from "../lib/strokes";
import { Sky } from "./Backdrop";
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

const boil = (t: number) => (
  <>
    <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves={1} seed={boilFrame(t)} />
    <feDisplacementMap in="SourceGraphic" scale={BOIL_PX} />
  </>
);

// Her figure's filter: the line boil, then the sky color multiplied in (`tint` of the way), so the cream
// figure sits in rain, dusk and night alike.
const FigureFilter: React.FC<{ id: string; t: number; tint: number }> = ({ id, t, tint }) => {
  const [r, g, b] = channels(mix("#FFFFFF", skyAt(t).bottom, tint));
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        {boil(t)}
        <feColorMatrix type="matrix" values={`${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`} />
      </filter>
    </svg>
  );
};

type Box = { left: number; top: number; w: number; h: number; origin: string };

// What the strokes leave of her: she can't be rubbed out all the way (消えて 消してよ, yet still holding on).
const GHOST = 0.18;

// Stroke-by-stroke erasing or drawing back over `range`, as a clip-path for a w×h element.
const strokesClip = (
  kind: "erase" | "redraw",
  range: [number, number],
  t: number,
  w: number,
  h: number,
  n: number,
  seed: string,
) =>
  toClipPath(
    (kind === "erase" ? erasePolygons : revealPolygons)(ramp(onThrees(t), range[0], range[1]), w, h, {
      n,
      seed,
      boil: boilFrame(t),
    }),
  );

// A figure, or while strokes clip it, a faint ghost of all of her under the part the strokes leave.
const Figure: React.FC<{ src: string; style: React.CSSProperties; clip?: string }> = ({ src, style, clip }) =>
  clip === undefined ? (
    <Img src={src} style={style} />
  ) : (
    <>
      <Img src={src} style={{ ...style, opacity: GHOST }} />
      <Img src={src} style={{ ...style, clipPath: clip }} />
    </>
  );

// A figure's silhouette laid on the ground from its rest point, clipped so it never rises into the sky.
const CastShadow: React.FC<{
  id: string; // unique per shadow, names its filter
  src: string;
  box: Box;
  shadow: Shadow;
  t: number;
  opacity: number;
  blur?: number; // extra softening, px
  clip?: string; // erased along with her, in the figure's own px
}> = ({ id, src, box, shadow, t, opacity, blur = 0, clip }) => {
  const { width, height } = useVideoConfig();
  const [a, b, c, d] = shadowMatrix(shadow);
  const ground = groundPoints(width, height);
  const groundArea = `M${ground.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}L${width + 20},${height + 20}L-20,${height + 20}Z`;

  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={`shadow-${id}`} colorInterpolationFilters="sRGB">
          {boil(t)}
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          clipPath: `path("${groundArea}")`,
          // softens the edge after the squash (filters run before clip-path, so the ground edge stays crisp)
          filter: `blur(${1 + blur}px)`,
          opacity,
        }}
      >
        <Img
          src={src}
          style={{
            position: "absolute",
            width: box.w,
            height: box.h,
            left: box.left,
            top: box.top,
            filter: `url(#shadow-${id})`,
            transformOrigin: box.origin,
            // the image is sunk FEET_SINK into the ground; the shadow starts at the line itself
            transform: `matrix(${a}, ${b}, ${c}, ${d}, 0, ${-FEET_SINK})`,
            clipPath: clip,
          }}
        />
      </AbsoluteFill>
    </>
  );
};

const SceneCharacter: React.FC<{
  scene: CharacterScene;
  t: number;
  vis: number;
}> = ({ scene, t, vis }) => {
  const { width, height } = useVideoConfig();
  const her = placeScene(scene, width, height, (x) => groundY(x, height));
  const id = scene.id;
  const img = staticFile(`characters/${id}.png`);
  const k = kimiAt(t);
  const kimi =
    scene.companion && k.presence > 0 ? placeCompanion(scene, t, width, height, (x) => groundY(x, height)) : null;
  const { erase } = scene;
  const clip =
    erase && t >= erase.from && t < erase.until
      ? strokesClip("erase", [erase.from, erase.to], t, her.w, her.h, 7, id)
      : undefined;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <FigureFilter id={`tint-${id}`} t={t} tint={scene.tint} />
      {/* 君: a shadow beside hers with no one casting it */}
      {kimi && (
        <CastShadow
          id={`${id}-kimi`}
          src={staticFile(`characters/${kimi.id}.png`)}
          box={kimi}
          shadow={scene.shadow}
          t={t}
          opacity={scene.shadow.opacity * k.presence}
          blur={k.blur}
        />
      )}
      <CastShadow id={id} src={img} box={her} shadow={scene.shadow} t={t} opacity={scene.shadow.opacity} clip={clip} />
      {/* breathing steps with the drawings instead of gliding between them */}
      <Figure
        src={img}
        clip={clip}
        style={{
          position: "absolute",
          width: her.w,
          height: her.h,
          left: her.left,
          top: her.top,
          filter: `url(#tint-${id})`,
          ...breathe(onThrees(t), 0, her.origin),
        }}
      />
    </AbsoluteFill>
  );
};

// Small figures on the horizon through the middle of the song, one pose per section,
// gone while a close-up covers the wide shot.
export const SceneCharacters: React.FC<{ t: number }> = ({ t }) => {
  const shown = 1 - closeUpCover(t);
  return (
    <>
      {CHARACTER_SCENES.map((scene) => {
        const vis = envelope(t, scene.window) * shown;
        return vis === 0 ? null : <SceneCharacter key={scene.id} scene={scene} t={t} vis={vis} />;
      })}
    </>
  );
};

const CloseUpShot: React.FC<{ shot: CloseUp; t: number; vis: number }> = ({ shot, t, vis }) => {
  const { width, height } = useVideoConfig();
  const pose = CHARACTER_SCENES.find((s) => s.id === shot.pose)!;
  const h = height * shot.h;
  const w = h * shot.aspect;
  const [cx, bottom] = [width * shot.x, height * shot.bottom];
  const clip = shot.redraw && t < shot.redraw[1] ? strokesClip("redraw", shot.redraw, t, w, h, 9, shot.id) : undefined;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Sky t={t} handCloseUp={shot.id === "close-hand"} />
      <FigureFilter
        id={`tint-${shot.id}`}
        t={t}
        tint={pose.tint - (shot.id === "close-hand" ? envelope(t, W.afterglow) * 0.1 : 0)}
      />
      {/* pushed in around the middle of the cut edge, which stays below the frame */}
      <AbsoluteFill style={{ transformOrigin: `${cx}px ${bottom}px`, scale: String(closeUpPush(shot, t)) }}>
        <Figure
          src={staticFile(`characters/${shot.id}.png`)}
          clip={clip}
          style={{
            position: "absolute",
            width: w,
            height: h,
            left: cx - w / 2,
            top: bottom - h,
            filter: `url(#tint-${shot.id})`,
            ...breathe(onThrees(t), 0),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Inserted shots over the wide shot's sky and ground; the scratches (傷跡) and lyrics stay on top.
export const CloseUps: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CLOSE_UPS.map((shot) => {
      const vis = envelope(t, shot.window);
      return vis === 0 ? null : <CloseUpShot key={shot.id} shot={shot} t={t} vis={vis} />;
    })}
  </>
);
