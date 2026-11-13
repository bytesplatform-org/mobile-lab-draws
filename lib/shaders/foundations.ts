/**
 * Photographs "developed" in GL (Blueprint's foundations shader, generalised
 * to any number of plates through one atlas texture, and re-tinted).
 *
 * At rest a photo is printed as an ink-and-teal duotone. As its plate lights
 * (uShow) it develops to full colour, bleeding in from the centre like ink
 * soaking into paper (a ragged, noise-driven front with a dark wet rim). Under
 * the pointer a glass lens refracts the print and shows the photograph in
 * full colour, with a slight chromatic split and a teal rim. One canvas draws
 * every plate; rects (canvas 0–1, y down), atlas cells and strengths are per
 * plate.
 */

import { NOISE } from "./noise";

export const MAX_PLATES = 10;

export const foundationsFragment = /* glsl */ `
varying vec2 vUv;
uniform float uTime; uniform vec2 uResolution; uniform vec2 uMouse; uniform float uRadius; uniform float uReady;
uniform vec4 uRects[${MAX_PLATES}]; uniform vec4 uCells[${MAX_PLATES}]; uniform float uShow[${MAX_PLATES}]; uniform float uCount;
uniform sampler2D uAtlas;
${NOISE}
const vec3 INK=vec3(0.024,0.067,0.059);
const vec3 TEAL=vec3(0.36,0.62,0.62);
const vec3 PAPER=vec3(0.92,0.95,0.93);
vec4 CELL;
vec3 photo(vec2 uv){ uv=clamp(uv,0.002,0.998); return texture2D(uAtlas,CELL.xy+uv*CELL.zw).rgb; }
vec3 duotone(vec3 c){
  float l=dot(c,vec3(0.299,0.587,0.114));
  vec3 d=mix(INK,TEAL,smoothstep(0.05,0.62,l));
  return mix(d,PAPER,smoothstep(0.66,1.0,l));
}
void main(){
  vec2 frag=vec2(vUv.x,1.0-vUv.y);
  int row=-1; vec4 r=vec4(0.0); float show=0.0;
  for(int i=0;i<${MAX_PLATES};i++){
    if(float(i)>=uCount) break;
    vec4 b=uRects[i];
    if(frag.x>=b.x&&frag.x<=b.z&&frag.y>=b.y&&frag.y<=b.w){ row=i; r=b; show=uShow[i]; CELL=uCells[i]; }
  }
  if(row<0||uReady<0.5){gl_FragColor=vec4(0.0);return;}
  float bh=max((r.w-r.y)*uResolution.y,1.0);
  float W=(r.z-r.x)*uResolution.x/bh;
  vec2 q=vec2((frag.x-r.x)*uResolution.x/bh,(frag.y-r.y)*uResolution.y/bh);
  float t=uTime;
  vec2 m=vec2((uMouse.x-r.x)*uResolution.x/bh,(uMouse.y-r.y)*uResolution.y/bh);

  // the cell is cropped to the plate's shape; a slow breathing zoom while lit
  vec2 uv=vec2(q.x/W,q.y)-0.5;
  uv*=1.0-0.05*show-0.012*sin(t*0.35+float(row));
  uv+=0.5;

  // the lens: only while the pointer is over this plate
  vec2 dq=q-m; float d=length(dq);
  float inside=smoothstep(-0.02,0.04,m.x)*smoothstep(W+0.02,W-0.04,m.x)*smoothstep(-0.02,0.04,m.y)*smoothstep(1.02,0.96,m.y);
  float R=0.26;
  float lens=(1.0-smoothstep(R*0.86,R,d))*inside;
  float k=clamp(1.0-(d*d)/(R*R),0.0,1.0);
  vec2 wob=vec2(snoise(q*3.0+t*0.4),snoise(q*3.0-t*0.37+7.1))*0.006;
  vec2 off=-dq*0.34*k+wob;
  off.x/=max(W,0.001);
  vec2 lu=uv+off*lens;
  vec3 lensed=vec3(photo(lu+vec2(0.003,0.0)*lens*(1.0-k)).r,photo(lu).g,photo(lu-vec2(0.003,0.0)*lens*(1.0-k)).b);

  // develop: colour soaks in from the centre as the plate lights
  vec3 full=photo(uv);
  vec3 printed=duotone(full);
  vec2 o=vec2(0.5*W,0.5);
  float reach=show*(W*0.75+0.85);
  float ragged=length(q-o)+fbm3(q*3.2+3.0+float(row))*0.3;
  float soaked=1.0-smoothstep(reach-0.16,reach,ragged);
  float wet=smoothstep(reach-0.2,reach-0.04,ragged)*soaked*step(show,0.995)*step(0.005,show);
  vec3 col=mix(printed,full*1.03,soaked);
  col=mix(col,INK,wet*0.5);
  col=mix(col,lensed*1.04,lens);
  float rim=(1.0-smoothstep(0.0,0.012,abs(d-R*0.93)))*inside;
  col=mix(col,vec3(0.55,0.86,0.86),rim*0.8);
  col+=vec3(0.85,1.0,0.98)*pow(max(0.0,1.0-length(dq-vec2(-0.07,-0.08))/0.1),3.0)*lens*0.18;

  // grain and a rounded plate edge
  col+=(hash12(frag*uResolution+fract(t)*31.0)-0.5)*0.03;
  vec2 sz=(r.zw-r.xy)*uResolution; vec2 pp=(frag-r.xy)*uResolution-sz*0.5;
  vec2 qq=abs(pp)-(sz*0.5-uRadius); float sd=length(max(qq,0.0))+min(max(qq.x,qq.y),0.0)-uRadius;
  float a=1.0-smoothstep(-1.5,0.0,sd);
  col=clamp(col,0.0,1.0);
  gl_FragColor=vec4(col*a,a);
}`;
