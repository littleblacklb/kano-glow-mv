import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { boilFrame } from "../lib/draw";
import { envelope, skyAt, W } from "../data/timeline";
import { afterglowAt } from "../data/afterglow";

export const Sky: React.FC<{ t: number; handCloseUp?: boolean }> = ({ t, handCloseUp = false }) => {
  const { top, bottom } = skyAt(t);
  const dusk = afterglowAt(t);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${top} 0%, ${bottom} 100%)` }}>
      {/* The close-up faces away from the horizon: only reflected light remains on her hand. */}
      {dusk.skyOpacity > 0 && !handCloseUp && (
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="none" width="100%" height="100%" style={{ opacity: dusk.skyOpacity }}>
          <defs>
            <linearGradient id="dusk-cloud-color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#653D58" stopOpacity={0.1} />
              <stop offset="0.58" stopColor="#BA6870" stopOpacity={0.62} />
              <stop offset="0.82" stopColor="#EB997B" stopOpacity={0.8} />
              <stop offset="1" stopColor="#B66A70" stopOpacity={0.12} />
            </linearGradient>
            <filter id="dusk-cloud-edge" x="-10%" y="-60%" width="120%" height="220%">
              <feTurbulence type="fractalNoise" baseFrequency="0.004 0.025" numOctaves={2} seed={17} />
              <feDisplacementMap in="SourceGraphic" scale={25} xChannelSelector="R" yChannelSelector="G" />
              <feGaussianBlur stdDeviation={5} />
            </filter>
          </defs>
          {/* Unequal, overlapping wisps: broken lower edges rather than an emissive straight bar. */}
          <g fill="url(#dusk-cloud-color)" filter="url(#dusk-cloud-edge)">
            <path d="M-80 698 Q80 674 190 689 Q275 658 390 671 Q455 644 546 663 Q615 652 694 677 Q760 675 843 704 Q701 703 655 724 Q592 713 521 734 Q436 710 367 729 Q264 719 220 740 Q101 720 -80 744Z" />
            <path d="M390 750 Q510 720 600 739 Q674 712 762 730 Q816 704 909 730 Q1001 712 1092 744 Q1140 737 1277 769 Q1158 764 1099 782 Q1007 763 930 788 Q839 766 770 785 Q671 763 604 780 Q519 756 390 775Z" opacity={0.68} />
            <path d="M890 665 Q970 647 1040 659 Q1102 635 1170 658 Q1247 650 1332 680 Q1234 674 1169 692 Q1119 681 1066 697 Q986 674 890 688Z" opacity={0.35} />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};

// Kept off during the flat-red cover scenes so they match the jacket.
export const Vignette: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill
    style={{
      opacity: 1 - envelope(t, W.character),
      background: "radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(10,6,12,0.34) 100%)",
    }}
  />
);

// grain.jpg is the frame size plus this margin, so it can shift without showing an edge.
const GRAIN_MARGIN = 512;

// Paper grain, shifted to a new random offset every drawing.
export const Grain: React.FC<{ t: number }> = ({ t }) => {
  const b = boilFrame(t);
  return (
    <AbsoluteFill style={{ overflow: "hidden", mixBlendMode: "overlay", opacity: 0.22 }}>
      <Img
        src={staticFile("grain.jpg")}
        style={{
          position: "absolute",
          left: -Math.floor(random(`gx${b}`) * GRAIN_MARGIN),
          top: -Math.floor(random(`gy${b}`) * GRAIN_MARGIN),
        }}
      />
    </AbsoluteFill>
  );
};

export const FadeToBlack: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ backgroundColor: "#000", opacity: 1 - envelope(t, W.fadeToBlack) }} />
);
