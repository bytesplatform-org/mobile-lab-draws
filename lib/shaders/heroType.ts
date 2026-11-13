/**
 * HERO: the headline drawn through a fluid (Blueprint's GL type, re-tinted).
 * The moving medium refracts the type with cool-teal and warm-red fringes,
 * heat (the pointer's wake) burns it toward teal, and each line is revealed
 * by a rising liquid front: the same ragged noise front, travelling up the
 * glyphs from the baseline like liquid filling a tube, with a bright
 * meniscus band at its surface that wobbles as it climbs.
 */

import { glyphChunk } from "@/lib/gl/glyphAtlas";
import { NOISE } from "./noise";

export const HERO_WORDS = 6;

export const heroTypeFragment = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uVelocity; uniform sampler2D uHeat;
${glyphChunk(HERO_WORDS)}
uniform vec2 uResolution; uniform float uTime; uniform float uText; uniform vec3 uReveal;
${NOISE}
const vec3 PAPER=vec3(0.945,0.957,0.941);
const vec3 TEAL=vec3(0.404,0.659,0.663);
const vec3 TEAL_HI=vec3(0.416,0.718,0.722);
const vec3 COOL=vec3(0.62,0.90,0.90);
const vec3 WARM=vec3(0.80,0.32,0.30);
vec3 burn(float k){ k=clamp(k,0.0,1.0); return k<0.5?mix(vec3(0.05,0.20,0.20),TEAL,k*2.0):mix(TEAL,vec3(0.88,0.98,0.97),k*2.0-1.0); }
void main(){
  vec2 vel=texture2D(uVelocity,vUv).xy; float heat=texture2D(uHeat,vUv).r;
  vec2 p=vec2(vUv.x,1.0-vUv.y)*uResolution;
  // Refraction: the moving medium bends what is seen through it.
  vec2 off=vec2(vel.x,-vel.y)*uResolution.y*0.022; float ol=length(off); if(ol>90.0) off*=90.0/ol;
  vec2 g=glyph(p-off)*uText; float word=glyphWord; float hol=glyphHollow; vec2 local=glyphLocal;
  float cold=glyph(p-off*1.9).x*uText; float warm=glyph(p-off*0.45).x*uText;
  float present=1.0; float lick=0.0;
  if(word>=0.0){
    int li=int(floor(word*0.5+0.01));
    float rv=li==0?uReveal.x:(li==1?uReveal.y:uReveal.z);
    // 0 at the foot of the line's glyph box, 1 at its head: the liquid rises
    float along=1.0-local.y;
    float slosh=(sin(p.x*0.017+uTime*2.1)*0.03+sin(p.x*0.043-uTime*1.4)*0.018)*(1.0-rv*rv);
    float ragged=along+snoise(p*0.011+vec2(uTime*0.12,0.0))*0.045+slosh;
    float front=rv*1.3-0.16;
    present=smoothstep(front+0.012,front-0.03,ragged);
    float band=(1.0-smoothstep(0.0,0.045,abs(ragged-front)))*step(rv,0.999)*step(0.001,rv);
    lick=band*g.y;
  }
  g*=present; cold*=present; warm*=present;
  float k=smoothstep(0.05,0.85,heat);
  float a=max(g.x,g.y*k);
  vec3 base=mix(PAPER,TEAL_HI,hol*0.9);
  vec3 col=mix(base,burn(k),k)*a;
  float fc=max(cold-g.x,0.0), fw=max(warm-g.x,0.0);
  col+=COOL*fc*0.8+WARM*fw*0.7; a=max(a,max(fc,fw)*0.8);
  col=col*(1.0-lick)+mix(TEAL_HI,vec3(0.92,1.0,0.99),0.45)*lick; a=a*(1.0-lick)+lick;
  a=clamp(a,0.0,1.0);
  gl_FragColor=vec4(min(col,vec3(a)),a);
}`;
