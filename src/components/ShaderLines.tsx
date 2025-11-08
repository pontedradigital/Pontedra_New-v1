import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  intensity?: number;
  colorA?: string;
  colorB?: string;
  blur?: number;
};

export default function ShaderLines({
  intensity = 1.0,
  colorA = "#57e389",
  colorB = "#00b4ff",
  blur = 0.6,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const uniformsRef = useRef<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -1000,
      1000
    );

    const geometry = new THREE.PlaneGeometry(width, height);

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_intensity: { value: intensity },
      u_colorA: { value: new THREE.Color(colorA) },
      u_colorB: { value: new THREE.Color(colorB) },
      u_scroll: { value: 0.0 },
      u_blur: { value: blur },
    };
    uniformsRef.current = uniforms;

    const fragmentShader = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_intensity;
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform float u_scroll;
    uniform float u_blur;

    float rand(float n){return fract(sin(n)*43758.5453123);}
    float noise(float x){
      float i = floor(x);
      float f = fract(x);
      float u = f*f*(3.0-2.0*f);
      return mix(rand(i), rand(i+1.0), u);
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5*u_resolution.xy) / u_resolution.y;

      float spacing = 0.008 + 0.002 * sin(u_time*0.2);
      float scrollShift = u_scroll * 0.6;
      float x = uv.x + scrollShift * 0.25;

      float v = 0.0;
      for (int i=1; i<=5; i++){
        float freq = float(i) * 20.0;
        float amp = 1.0/float(i);
        float pos = fract(x*freq + u_time*0.03*float(i));
        float stripe = smoothstep(0.5 - spacing*float(i), 0.5 + spacing*float(i), pos);
        v += stripe * amp;
      }
      v = clamp(v, 0.0, 1.0);

      float dist = length(p);
      float ring = smoothstep(0.65, 0.4, dist);

      float n = noise(u_time*0.5 + uv.x*10.0);
      float flick = mix(0.8, 1.2, n);

      vec3 color = mix(u_colorA, u_colorB, uv.x * 0.8 + 0.1);
      vec3 glow = color * v * ring * u_intensity * flick;

      float blurFactor = u_blur;
      vec3 blurSample = vec3(0.0);
      blurSample += glow * 0.5;
      blurSample += glow * 0.25 * smoothstep(0.0, 0.5, abs(uv.x-0.5)*2.0);
      vec3 col = blurSample;

      col = col * (0.6 + 0.4*ring);

      vec3 bg = vec3(0.03, 0.05, 0.06);
      vec3 outColor = bg + col;

      gl_FragColor = vec4(outColor, 1.0);
    }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(w, h);
      camera.left = w / -2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = h / -2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    let lastScroll = 0;
    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const s = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      lastScroll = s;
      if (uniforms.u_scroll) uniforms.u_scroll.value = s;
    };
    window.addEventListener("scroll", onScroll);
    onScroll();

    const clock = new THREE.Clock();
    const tick = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      if (uniforms.u_scroll) uniforms.u_scroll.value += (lastScroll - uniforms.u_scroll.value) * 0.08;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      if (container.firstChild) container.removeChild(container.firstChild);
    };
  }, [intensity, colorA, colorB, blur]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      aria-hidden
      style={{ willChange: "transform" }}
    />
  );
}