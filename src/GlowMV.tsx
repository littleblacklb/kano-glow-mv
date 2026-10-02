import { Audio } from "@remotion/media";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { useEffect, useState } from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import { FadeToBlack, Grain, Sky, Vignette } from "./components/Backdrop";
import { Camera } from "./components/Camera";
import { Character, CloseUps, SceneCharacters } from "./components/Character";
import { Lyrics } from "./components/Lyrics";
import { ScarLines } from "./components/ScarLines";
import { Clouds, Horizon, LightLeak, Sun, TornClouds } from "./components/Scenery";
import { Credits, TitleCard } from "./components/Titles";
import { Afterglow, InkBleed, Rain, Stars } from "./components/Weather";
import { envelope, W } from "./data/timeline";
import { parseLrc, type LyricLine } from "./lib/parseLrc";

const AUDIO = staticFile("glow.mp3");

export const FPS = 30;
// glow.mp3 is 283.03s long.
export const DURATION_IN_FRAMES = Math.ceil(283.03 * FPS);

// 0–1 loudness of the low end, used to let light breathe with the guitar.
const useBassAmp = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: AUDIO, frame, fps, windowInSeconds: 10 });
  if (!audioData) return 0;
  const freqs = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 64,
    optimizeFor: "speed",
    dataOffsetInSeconds,
  });
  const low = freqs.slice(0, 12).reduce((s, v) => s + v, 0) / 12;
  const db = 20 * Math.log10(Math.max(low, 1e-5));
  return Math.min(1, Math.max(0, (db + 42) / 30));
};

const useLyrics = () => {
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading glow.lrc"));
  useEffect(() => {
    fetch(staticFile("glow.lrc"))
      .then((r) => r.text())
      .then((txt) => {
        setLines(parseLrc(txt));
        continueRender(handle);
      })
      .catch(cancelRender);
  }, [continueRender, cancelRender, handle]);
  return lines;
};

export const GlowMV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const amp = useBassAmp();
  const lines = useLyrics();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera t={t}>
        <Sky t={t} />
        <Stars t={t} amp={amp} />
        <Sun t={t} amp={amp} />
        <Clouds t={t} />
        <Horizon t={t} />
      </Camera>
      <CloseUps t={t} />
      {/* Continuous dusk illumination across the close-up and its return to the wide shot. */}
      <Afterglow t={t} />
      <Camera t={t}>
        <Rain t={t} />
        <InkBleed t={t} />
        <ScarLines t={t} />
        <SceneCharacters t={t} />
        <TornClouds t={t} />
        <LightLeak t={t} />
      </Camera>
      <Character t={t} amp={amp} />
      <TitleCard t={t} />
      {lines && <Lyrics lines={lines} scrim={envelope(t, W.horizon)} />}
      <Credits t={t} />
      <Grain t={t} />
      <Vignette t={t} />
      <FadeToBlack t={t} />
      <Audio src={AUDIO} />
    </AbsoluteFill>
  );
};
