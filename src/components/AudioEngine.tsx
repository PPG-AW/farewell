"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

type Zone = "hub" | "uksw" | "ppl" | "yonif" | "bukit";

const CHORDS: Record<Zone, number[]> = {
  hub: [220, 277.18, 329.63],
  uksw: [261.63, 329.63, 392],
  ppl: [196, 246.94, 293.66],
  yonif: [146.83, 220, 293.66],
  bukit: [174.61, 220, 261.63],
};
const WIND_FREQ: Record<Zone, number> = { hub: 320, uksw: 620, ppl: 460, yonif: 210, bukit: 300 };
const WIND_GAIN: Record<Zone, number> = { hub: 0.014, uksw: 0.035, ppl: 0.03, yonif: 0.045, bukit: 0.05 };

export default function AudioEngine() {
  const audioOn = useStore((s) => s.audioOn);
  const scene = useStore((s) => s.scene);
  const nodes = useRef<{
    ctx: AudioContext;
    master: GainNode;
    windGain: GainNode;
    windFilter: BiquadFilterNode;
    padOscs: OscillatorNode[];
    padGain: GainNode;
    timers: number[];
  } | null>(null);

  useEffect(() => {
    if (!audioOn) {
      const n = nodes.current;
      if (n) {
        n.master.gain.setTargetAtTime(0, n.ctx.currentTime, 0.4);
        n.timers.forEach((t) => window.clearTimeout(t));
        window.setTimeout(() => n.ctx.close().catch(() => {}), 1200);
        nodes.current = null;
      }
      return;
    }

    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // angin: noise → bandpass
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.Q.value = 0.7;
    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    noise.connect(windFilter).connect(windGain).connect(master);
    noise.start();

    // pad lembut (3 osilator triad)
    const padGain = ctx.createGain();
    padGain.gain.value = 0.016;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 900;
    padGain.connect(padFilter).connect(master);
    const padOscs = CHORDS.hub.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = i % 2 ? 4 : -4;
      o.connect(padGain);
      o.start();
      return o;
    });

    // burung berkicau sesekali
    const timers: number[] = [];
    const chirp = () => {
      if (!nodes.current) return;
      const zone = useStore.getState().scene;
      if (zone === "uksw" || zone === "bukit" || zone === "ppl") {
        const t = ctx.currentTime;
        [0, 0.09, 0.18].forEach((d, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(2200 - i * 260 + Math.random() * 300, t + d);
          g.gain.setValueAtTime(0, t + d);
          g.gain.linearRampToValueAtTime(0.022, t + d + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0005, t + d + 0.09);
          o.connect(g).connect(master);
          o.start(t + d);
          o.stop(t + d + 0.1);
        });
      }
      timers.push(window.setTimeout(chirp, 6000 + Math.random() * 9000));
    };
    timers.push(window.setTimeout(chirp, 3000));

    // retak api unggun (yonif)
    const crackle = () => {
      if (!nodes.current) return;
      if (useStore.getState().scene === "yonif") {
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 900 + Math.random() * 2200;
        f.Q.value = 2;
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 0.05);
        src.connect(f).connect(g).connect(master);
        src.start(t, Math.random());
        src.stop(t + 0.06);
      }
      timers.push(window.setTimeout(crackle, 280 + Math.random() * 700));
    };
    timers.push(window.setTimeout(crackle, 500));

    master.gain.setTargetAtTime(0.85, ctx.currentTime, 1.2);
    nodes.current = { ctx, master, windGain, windFilter, padOscs, padGain, timers };

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      ctx.close().catch(() => {});
      nodes.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioOn]);

  // transisi suasana antar zona
  useEffect(() => {
    const n = nodes.current;
    if (!n) return;
    const z = scene as Zone;
    const t = n.ctx.currentTime;
    CHORDS[z].forEach((f, i) => n.padOscs[i]?.frequency.setTargetAtTime(f, t, 0.8));
    n.windFilter.frequency.setTargetAtTime(WIND_FREQ[z], t, 0.8);
    n.windGain.gain.setTargetAtTime(WIND_GAIN[z], t, 0.8);
    n.padGain.gain.setTargetAtTime(z === "yonif" ? 0.012 : 0.016, t, 0.8);
  }, [scene]);

  return null;
}
