// ---- tiny pixel-art painter: shapes in a 32-unit space, lit from the top-left, hue-shifted ramps, auto outlines
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function hex(s){return[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));}
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.map((c,i)=>Math.max(0,Math.min(255,Math.round(c+(B[i]-c)*t))).toString(16).padStart(2,'0')).join('');}
function ramp(base,opt={}){ // h highlight · l light · b base · s shade · d deep · o outline
  const cool=opt.cool||'#2a1745',warm=opt.warm||'#fff1c9';
  return{h:mix(base,'#ffffff',opt.hi??.62),l:mix(base,warm,.34),b:base,s:mix(base,cool,.36),d:mix(base,cool,.6),o:mix(base,'#120a1c',.78)};
}
function tone(r,v,x,y,dither=.1){const t=v+((BAYER[y&3][x&3]+.5)/16-.5)*dither;return t>.93?r.h:t>.74?r.l:t>.44?r.b:t>.22?r.s:r.d;}
const LIGHT=(()=>{const v=[-.55,-.68,.48],n=Math.hypot(...v);return v.map(c=>c/n);})();

function Painter(S=1,U=32){
  const W=Math.round(U*S),buf=new Array(W*W).fill(null);
  const idx=(x,y)=>y*W+x,inb=(x,y)=>x>=0&&y>=0&&x<W&&y<W;
  const T={x:0,y:0};
  function api(L){
    const set=(x,y,c)=>{if(inb(x,y)&&c)L[idx(x,y)]=c;};
    const A={
      W,S,set,
      get:(x,y)=>inb(x,y)?L[idx(x,y)]:null,
      // lit ellipsoid
      ell(cx,cy,rx,ry,r,o={}){cx+=T.x;cy+=T.y;const x0=Math.floor((cx-rx)*S),x1=Math.ceil((cx+rx)*S),y0=Math.floor((cy-ry)*S),y1=Math.ceil((cy+ry)*S);
        for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const nx=((x+.5)/S-cx)/rx,ny=((y+.5)/S-cy)/ry,q=nx*nx+ny*ny;if(q>1)continue;if(o.clip&&!o.clip((x+.5)/S-T.x,(y+.5)/S-T.y))continue;
          if(o.flat){set(x,y,o.flat);continue;}
          const nz=Math.sqrt(1-q);let v=.5+.62*(nx*LIGHT[0]+ny*LIGHT[1]+nz*LIGHT[2]*.55)-(o.dark||0);if(o.spec&&Math.hypot(nx+.42,ny+.5)<o.spec)v=1;
          set(x,y,tone(r,v,x,y,o.dither??.1));}},
      // flat polygon (unit coords)
      poly(pts,c,o={}){pts=pts.map(p=>[p[0]+T.x,p[1]+T.y]);const ys=pts.map(p=>p[1]),y0=Math.floor(Math.min(...ys)*S),y1=Math.ceil(Math.max(...ys)*S);
        for(let y=y0;y<=y1;y++){const yy=(y+.5)/S,xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy))xs.push(a[0]+(yy-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
          xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]*S);x<Math.round(xs[k+1]*S);x++){const col=typeof c==='function'?c((x+.5)/S-T.x,yy-T.y,x,y):c;if(col)set(x,y,col);}}},
      rect(x,y,w,h,c){A.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c);},
      // upright cylinder: shaded across x
      cyl(x,y,w,h,r,o={}){A.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],(ux,uy,px,py)=>{const nx=(ux-(x+w/2))/(w/2);const v=.62-nx*.42-(Math.abs(nx)>.8?.12:0)+(nx>-.62&&nx<-.38?.3:0)-(o.dark||0);return tone(r,v,px,py,o.dither??.08);});},
      line(x0,y0,x1,y1,th,c){x0+=T.x;x1+=T.x;y0+=T.y;y1+=T.y;const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*S*2)+1;for(let i=0;i<=n;i++){const t=i/n,ux=x0+(x1-x0)*t,uy=y0+(y1-y0)*t,h=Math.max(1,Math.round(th*S));const px=Math.round(ux*S-h/2),py=Math.round(uy*S-h/2);for(let a=0;a<h;a++)for(let b=0;b<h;b++)set(px+a,py+b,typeof c==='function'?c(ux-T.x,uy-T.y,px+a,py+b):c);}},
      px(x,y,c,w=1,h=1){x+=T.x;y+=T.y;const X=Math.round(x*S),Y=Math.round(y*S),ww=Math.max(1,Math.round(w*S)),hh=Math.max(1,Math.round(h*S));for(let a=0;a<ww;a++)for(let b=0;b<hh;b++)set(X+a,Y+b,c);},
      // recolour only already-painted pixels (patterns, bands)
      over(test,c){for(let y=0;y<W;y++)for(let x=0;x<W;x++){if(!L[idx(x,y)])continue;const r=test((x+.5)/S-T.x,(y+.5)/S-T.y,x,y);if(r)L[idx(x,y)]=typeof c==='function'?c(L[idx(x,y)],x,y):c;}},
      erase(test){for(let y=0;y<W;y++)for(let x=0;x<W;x++)if(L[idx(x,y)]&&test((x+.5)/S-T.x,(y+.5)/S-T.y))L[idx(x,y)]=null;},
    };return A;
  }
  function outlineLayer(L,col){const add=[];for(let y=0;y<W;y++)for(let x=0;x<W;x++){if(L[idx(x,y)])continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>inb(x+dx,y+dy)&&L[idx(x+dx,y+dy)]))add.push(idx(x,y));}add.forEach(i=>L[i]=col);}
  return{
    W,buf,S,U,
    shift(x,y){T.x=x;T.y=y;},
    // paste another painter's pixels, optionally turned a quarter clockwise (lossless, so it stays crisp)
    stamp(Q,ox,oy,rot){const X=Math.round(ox*S),Y=Math.round(oy*S),n=Q.W;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=Q.buf[y*n+x];if(!c)continue;const dx=rot==='cw'?n-1-y:x,dy=rot==='cw'?x:y;if(inb(X+dx,Y+dy))buf[idx(X+dx,Y+dy)]=c;}},
    part(fn,o={}){const L=new Array(W*W).fill(null);fn(api(L));if(o.outline)outlineLayer(L,o.outline);for(let i=0;i<L.length;i++)if(L[i])buf[i]=L[i];},
    fx(fn){fn(api(buf));},
    blit(ctx,ox=0,oy=0){for(let y=0;y<W;y++)for(let x=0;x<W;x++){const c=buf[idx(x,y)];if(c){ctx.fillStyle=c;ctx.fillRect(ox+x,oy+y,1,1);}}},
  };
}
if(typeof module!=='undefined')module.exports={Painter,ramp,mix,tone,hex};
