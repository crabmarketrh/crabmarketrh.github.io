// ---- Shell Companies: crab anatomy + shell recipes (all coordinates in a 32-unit box)
const PAPERC='#f4efe2';
const R_STEEL=ramp('#9fb0c0'),R_DARK=ramp('#3a3f5c',{hi:.45}),R_BONE=ramp('#efe6d2'),R_WOOD=ramp('#9a6233'),R_GOLD=ramp('#f4b730',{warm:'#fff6b8',cool:'#7a3b10'}),R_PAPER=ramp(PAPERC),R_CARD=ramp('#c49a62'),R_BRASS=ramp('#c98d3a',{cool:'#4a2612'}),R_GLASS=ramp('#58c7e8'),R_RED=ramp('#e2413b');
const mx=x=>32-x;
const R_LEAF_C=ramp('#4fb84a',{cool:'#123a2a'});

const SHELLS={
  turret(P,C){const sl=(ux,uy)=>(uy-(ux-16)*.22-1.4)/3.1;P.part(A=>{
      A.poly([[16.4,1.4],[18,1.4],[26,19.6],[6.4,19.6]],(ux,uy,px,py)=>{const half=.8+(uy-1.4)/18.2*9.8,nx=(ux-16.4)/half,r=Math.floor(sl(ux,uy))%2?C.alt:C.main;return tone(r,.68-nx*.46+(nx>-.55&&nx<-.3?.22:0),px,py,.08);});
      A.over((ux,uy)=>{const v=sl(ux,uy);return v-Math.floor(v)<.2&&uy>3.4;},C.main.d);A.over((ux,uy)=>{const v=sl(ux,uy);return v-Math.floor(v)>.2&&v-Math.floor(v)<.42&&ux<14.5&&uy>5;},(old)=>old===C.main.d?old:C.main.h);},{outline:C.main.o});},
  snail(P,C){P.part(A=>{A.ell(16.2,11.2,9.8,9.2,C.main,{spec:.2});
      for(let th=0;th<Math.PI*5.2;th+=.05){const rr=.62*th,x=17.2+rr*Math.cos(th),y=11.4+rr*.93*Math.sin(th),X=Math.round(x*A.S),Y=Math.round((y+1)*A.S);if(A.get(X,Y)){A.set(X,Y,C.main.d);if(A.get(X-1,Y-1)&&A.get(X-1,Y-1)!==C.main.d)A.set(X-1,Y-1,C.main.l);}}
      if(C.pat===1)for(const[x,y]of[[9,7.6],[22.4,6.6],[7.8,13],[23.8,12.6],[15.4,2.8],[11.6,17.4],[21,17.2],[19.6,3.4]]){A.px(x,y,C.alt.h,2,2);A.px(x+1,y+1,C.alt.s,1,1);}
    },{outline:C.main.o});
  },
  conch(P,C){const pink=ramp('#ff9fb0',{cool:'#7a2a4a'});
    P.part(A=>{A.poly([[19.6,9.6],[27.4,12],[27,18.4],[20,19.6]],(ux,uy,px,py)=>tone(pink,.85-(ux-20)*.05,px,py,.08));A.poly([[21.4,12.2],[25.4,13.4],[25,17.4],[21.4,18.2]],pink.d);},{outline:C.main.o});
    P.part(A=>{for(const[x,y,a]of[[6.8,11.4,-2.55],[9.6,8.2,-2.15],[13.4,6.8,-1.8],[18,6.8,-1.4],[21.6,8.4,-1.05]])A.poly([[x-1.5,y+2],[x+1.5,y+2],[x+Math.cos(a)*3.8,y+Math.sin(a)*3.8]],C.main.l);},{outline:C.main.o});
    P.part(A=>{A.ell(15.2,14,9.2,6.4,C.main,{spec:.18});A.over((ux,uy)=>Math.abs(Math.sin(ux*1.2))>.94&&uy>9.6,C.main.s);A.over((ux,uy)=>uy>17.6,C.main.s);},{outline:C.main.o});
    P.part(A=>{A.poly([[11.4,9.4],[19,9.4],[15.2,1.6]],(ux,uy,px,py)=>tone(C.alt,.78-(ux-13)*.07,px,py,.06));A.over((ux,uy)=>Math.abs(uy-6.6-(ux-15.2)*.2)<.5||Math.abs(uy-4.2-(ux-15.2)*.2)<.45,C.alt.d);},{outline:C.main.o});},
  scallop(P,C){P.part(A=>{A.ell(16,19.5,11.5,15.5,C.main,{clip:(x,y)=>y<19.6,spec:.16});
      for(let k=-4;k<=4;k++){const a=-Math.PI/2+k*.33;A.line(16,19.5,16+Math.cos(a)*16,19.5+Math.sin(a)*16,1,(ux,uy,px,py)=>A.get(px,py)?C.main.s:null);}
      if(C.pat===1)A.over((ux,uy)=>{const d=Math.hypot(ux-16,(uy-19.5)*.74);return d>5.4&&d<7.2||d>9.6&&d<10.8;},C.alt.b);A.over((ux,uy)=>uy>17.8,C.alt.b);},{outline:C.main.o});},
  can(P,C){P.part(A=>{A.cyl(9,4.6,14,15,R_STEEL);A.cyl(9,8.4,14,7.6,C.main);if(C.pat===0){A.rect(9.8,11,12.4,1.5,PAPERC);A.rect(9.8,12.5,12.4,.8,C.main.d);}else if(C.pat===1){A.ell(16,12.2,3.4,2.6,R_PAPER,{flat:PAPERC});A.poly([[18.6,12.2],[21,10.4],[21,14]],PAPERC);A.px(14.4,11.6,C.main.o,1,1);}else{for(let x=10.2;x<22;x+=2.4)A.rect(x,9.4,1.2,5.6,C.alt.b);}
      A.rect(9,6.9,14,.8,R_STEEL.s);A.rect(9,17.2,14,.8,R_STEEL.s);A.px(12,14.5,C.main.l,2,1);},{outline:R_STEEL.o});
    P.part(A=>{A.ell(16,4.6,7,1.9,R_STEEL,{flat:R_STEEL.l});A.ell(16,4.7,5.4,1.2,R_STEEL,{flat:R_STEEL.d});A.px(18.5,3.2,R_STEEL.h,3,1);A.px(20.6,2.4,R_STEEL.l,1,1);},{outline:R_STEEL.o});},
  tophat(P,C){P.part(A=>{A.cyl(10,2.4,12,15,R_DARK);A.cyl(10,12.6,12,2.8,C.main);A.px(14,13.4,R_GOLD.b,2,1.4);},{outline:R_DARK.o});
    P.part(A=>A.ell(16,2.5,6,1.5,R_DARK,{flat:R_DARK.l}),{outline:R_DARK.o});
    P.part(A=>{A.ell(16,18,10.8,2.5,R_DARK);},{outline:R_DARK.o});},
  teacup(P,C){const W=R_PAPER;P.part(A=>{A.ell(25.8,11.6,3.6,4.4,W,{spec:.1});A.erase((x,y)=>((x-25.6)/1.8)**2+((y-11.6)/2.5)**2<1);},{outline:W.o});
    P.part(A=>{A.poly([[6.8,6.4],[25.2,6.4],[22.4,19.6],[9.6,19.6]],(ux,uy,px,py)=>{const half=9.2-(uy-6.4)/13.2*2.8;return tone(W,.7-((ux-16)/half)*.4,px,py,.08);});
      if(C.pat===1)A.over((ux,uy)=>Math.floor((ux-6.8)/2.3)%2===0&&uy>8.6,(old)=>old===W.s||old===W.d?C.main.s:C.main.b);else{A.over((ux,uy)=>uy>10.4&&uy<13,(old)=>old===W.s||old===W.d?C.main.s:C.main.b);A.over((ux,uy)=>uy>16.4&&uy<17.4,C.main.l);}},{outline:W.o});
    P.part(A=>{A.ell(16,6.4,9.4,2.4,W,{flat:W.h});A.ell(16,6.7,7.8,1.6,W,{flat:'#8a4b22'});A.ell(14.4,6.4,3,.7,W,{flat:'#b8713a'});},{outline:W.o});
    P.fx(A=>{for(const[x,y]of[[13,3.2],[14,2],[13.4,.8],[18.6,3.6],[19.6,2.4],[19,1.2]])A.px(x,y,'#eef3f8',1,1);});},
  skull(P,C){P.part(A=>{A.rect(10.6,15.6,10.8,5.4,R_BONE.b);A.rect(10.6,19.6,10.8,1.4,R_BONE.s);for(let x=12.2;x<20.4;x+=2)A.px(x,17,R_BONE.o,.8,3.4);A.rect(11.2,15.6,9.6,.9,R_BONE.s);if(C.pat===2){A.px(13.1,16.6,R_GOLD.b,1.3,3.4);A.px(13.1,16.6,R_GOLD.h,1.3,1);}},{outline:R_BONE.o});
    P.part(A=>{A.ell(16,10.9,8.8,7.4,R_BONE,{spec:.2});A.ell(12.5,11.8,2.4,2.7,R_BONE,{flat:R_BONE.o});A.ell(19.5,11.8,2.4,2.7,R_BONE,{flat:R_BONE.o});
      A.px(12.2,11,C.main.l,1,1);A.px(19.2,11,C.main.l,1,1);A.poly([[16,13.2],[14.9,15.4],[17.1,15.4]],R_BONE.o);if(C.pat===1){A.line(20,4,21.4,6.6,1,R_BONE.o);A.line(21.4,6.6,20.4,8.4,1,R_BONE.o);A.line(21.4,6.6,23,7.6,1,R_BONE.o);}},{outline:R_BONE.o});},
  dice(P,C){const r=C.main,pp=(A,x,y,c)=>A.px(x-.3,y-.3,c,2.3,2.3);
    P.part(A=>{A.poly([[8,7.4],[20.5,7.4],[20.5,19.6],[8,19.6]],r.b);A.poly([[20.5,7.4],[25.4,4],[25.4,15.8],[20.5,19.6]],r.s);A.poly([[8,7.4],[13,4],[25.4,4],[20.5,7.4]],r.l);
      A.poly([[8,7.4],[20.5,7.4],[20.5,8.2],[8,8.2]],r.l);
      for(const[x,y]of[[10,9.5],[16.8,9.5],[13.4,12.7],[10,15.9],[16.8,15.9]])pp(A,x,y,PAPERC);for(const[x,y]of[[22,8.5],[22.6,13.4]])pp(A,x,y,r.h);pp(A,16,4.8,PAPERC);},{outline:r.o});},
  box(P,C){const gift=C.pat===2,r=gift?C.main:R_CARD,tape=gift?C.alt:C.main;P.part(A=>{A.poly([[7.6,9],[5.2,4.4],[15.4,4.4],[16,9]],r.l);A.poly([[16,9],[17,3.6],[26.6,5.2],[24.4,9]],r.b);},{outline:r.o});
    P.part(A=>{A.poly([[7.6,9],[20.6,9],[20.6,19.6],[7.6,19.6]],r.b);A.poly([[20.6,9],[24.6,6.6],[24.6,16.6],[20.6,19.6]],r.s);A.rect(7.6,9,13,.9,r.d);A.rect(12.9,9,2.4,10.6,tape.l);A.rect(12.9,9,2.4,.9,tape.s);if(gift)A.rect(7.6,13,13,2,tape.l);if(C.pat===1){A.rect(15.8,10.6,4.4,2.6,R_RED.b);A.rect(16.4,11.4,3.2,.8,PAPERC);}
      if(!gift){A.poly([[17,15],[18.2,13.4],[19.4,15]],C.main.b);A.rect(17.7,15,1,2.2,C.main.b);}A.px(9,16.5,r.s,2.6,.8);A.px(9,17.8,r.s,1.8,.8);},{outline:r.o});},
  coconut(P,C){const r=ramp('#7a4a26');P.part(A=>{A.ell(16,18.6,9.8,13.2,r,{clip:(x,y)=>y<18.8,spec:.12});A.over((ux,uy,x,y)=>((x*7+y*13)%11===0),r.d);A.over((ux,uy,x,y)=>((x*5+y*3)%17===0),r.l);
      A.ell(14,8.8,1,1.1,r,{flat:r.o});A.ell(18,8.8,1,1.1,r,{flat:r.o});A.ell(16,11,1,1.1,r,{flat:r.o});A.rect(6.2,17.6,19.6,1.5,R_PAPER.b);A.rect(6.2,18.4,19.6,.7,R_PAPER.s);
      if(C.pat===1){A.erase((x,y)=>y<7.2);A.ell(16,7.6,6.6,2.4,r,{flat:r.o});A.ell(16,7.4,5.8,1.9,R_PAPER,{flat:PAPERC});A.ell(16,7.8,3.6,1,R_PAPER,{flat:R_PAPER.s});A.px(12,6.6,'#ffffff',2,.8);}},{outline:r.o});
    if(C.pat===2){P.part(A=>A.line(20.4,7,23.6,2.4,1,R_RED.b),{outline:R_RED.o});P.part(A=>{A.line(11.8,4.4,12.8,8.6,1,R_WOOD.s);A.ell(11.6,4.4,4,3,C.main,{clip:(x,y)=>y<4.8});A.over((ux,uy)=>Math.floor(ux/1.5)%2===0&&uy<4.8,C.main.l);},{outline:C.main.o});}},
  cone(P,C){const r=C.main;P.part(A=>A.rect(5.4,17.4,21.2,2.4,r.s),{outline:r.o});
    P.part(A=>{const sh=(ux,uy,px,py)=>{const half=1.9+(uy-2)/15.6*6.2,nx=(ux-16)/half;return tone(r,.62-nx*.42,px,py,.08);};A.poly([[14.1,2],[17.9,2],[24.1,17.6],[7.9,17.6]],sh);
      A.over((ux,uy)=>(uy>6.2&&uy<8.8)||(uy>11.6&&uy<14.4),(old)=>old===r.d||old===r.s?R_PAPER.s:PAPERC);A.rect(14.4,1.6,3.2,.9,r.l);},{outline:r.o});},
  mushroom(P,C){P.part(A=>{A.cyl(12,12,8,7.8,R_BONE);},{outline:R_BONE.o});
    P.part(A=>{A.ell(16,12.4,11.4,9.6,C.main,{clip:(x,y)=>y<12.8,spec:.16});for(const[x,y,r]of[[10.2,8.4,1.8],[16.6,5.6,2],[22,8.6,1.6],[13.4,11,1.1],[19.4,11.2,1]])A.over((ux,uy)=>Math.hypot(ux-x,uy-y)<r,(old)=>old===C.main.d||old===C.main.s?R_PAPER.s:PAPERC);A.rect(4.8,12,22.4,1.2,R_BONE.s);},{outline:C.main.o});},
  acorn(P,C){const n=ramp('#d19a4e'),k=ramp('#7a4a26');P.part(A=>{A.ell(16,13.4,8.2,7.4,n,{spec:.22});A.px(15.4,20,n.d,1.4,1);},{outline:n.o});
    P.part(A=>{A.ell(16,9.6,9.6,6.6,k,{clip:(x,y)=>y<10.4,spec:.1});A.over((ux,uy,x,y)=>(x+y)%3===0,k.d);A.over((ux,uy,x,y)=>(x-y+30)%5===0,k.l);A.rect(6.4,9.6,19.2,1,k.d);A.rect(15.4,1.4,1.4,2.4,k.b);},{outline:k.o});
    if(C.pat===1)P.part(A=>{A.ell(19.8,2.2,3.2,1.7,R_LEAF_C);A.line(17,2.6,22.4,1.8,1,R_LEAF_C.d);},{outline:R_LEAF_C.o});},
  flowerpot(P,C){const glazed=C.pat>=2,t=glazed?C.main:ramp('#cf6f3e'),G=R_LEAF_C;
    if(C.pat===0||C.pat===2)P.part(A=>{A.line(16,6,16,2.6,1,G.s);A.ell(13.4,3,2.4,1.5,G);A.ell(18.6,2.2,2.4,1.5,G);},{outline:G.o});
    if(C.pat===1||C.pat===4){P.part(A=>{A.line(16,6,16,3,1,G.s);A.ell(13.6,5,1.8,1,G);},{outline:G.o});P.part(A=>{for(let k=0;k<5;k++){const a=k*1.2566-1.57;A.ell(16+Math.cos(a)*1.9,2.8+Math.sin(a)*1.7,1.3,1.2,R_PAPER,{flat:C.pat===4?'#ffe27a':'#ff8fb1'});}A.ell(16,2.8,1,1,R_GOLD,{flat:C.pat===4?'#e2413b':'#ffd34e'});},{outline:'#5a2440'});}
    if(C.pat===3)P.part(A=>{A.cyl(14.2,.8,3.6,5.4,G);A.ell(16,1,1.8,1.2,G,{flat:G.l});A.rect(12,3,2.2,1.2,G.b);A.rect(12,1.8,1.2,1.4,G.b);A.rect(17.8,3.8,2.2,1.2,G.s);A.rect(18.8,2.4,1.2,1.6,G.s);A.px(15,2,PAPERC,.7,.7);A.px(16.4,3.6,PAPERC,.7,.7);},{outline:G.o});
    P.part(A=>{A.poly([[10.4,5.6],[21.6,5.6],[24,16],[8,16]],(ux,uy,px,py)=>{const half=5.6+(uy-5.6)/10.4*2.4;return tone(t,.64-((ux-16)/half)*.42,px,py,.08);});A.rect(14.8,5.6,2.4,.9,t.o);if(C.pat===4)A.over((ux,uy)=>uy>9&&uy<11.6,(old)=>old===t.d||old===t.s?C.main.s:C.main.b);},{outline:t.o});
    P.part(A=>{A.cyl(6.6,16,18.8,3.6,t);A.rect(6.6,16,18.8,.9,t.h);},{outline:t.o});},
  partyhat(P,C){P.part(A=>{A.poly([[16,3.6],[23.8,19.6],[8.2,19.6]],(ux,uy,px,py)=>{const half=(uy-3.6)/16*7.8+.01,nx=(ux-16)/half,r=Math.floor((ux+uy)/2.6)%2?C.main:C.alt;return tone(r,.64-nx*.4,px,py,.08);});A.rect(8.2,18.4,15.6,1.2,C.main.d);},{outline:C.main.o});
    P.part(A=>A.ell(16,3.6,2.1,2.1,R_PAPER,{spec:.3}),{outline:R_PAPER.o});},
  house(P,C){P.part(A=>{A.rect(20.4,2.6,2.8,5.4,R_RED.s);A.rect(20,2,3.6,1.1,R_RED.b);},{outline:R_RED.o});
    P.part(A=>{A.cyl(7.6,9.4,16.8,10.2,R_PAPER,{dither:.04});for(const x of[9.6,19])(A.rect(x,11.4,3.6,3.6,'#ffd76a'),A.rect(x+1.5,11.4,.7,3.6,R_WOOD.d),A.rect(x,12.9,3.6,.7,R_WOOD.d),A.rect(x-.4,15,4.4,.8,R_WOOD.b));A.ell(16,12.6,1.7,1.7,R_GLASS,{flat:R_GLASS.l});A.rect(7.6,18,16.8,1.6,R_PAPER.s);},{outline:R_WOOD.o});
    P.part(A=>{A.poly([[4.6,10.6],[16,1.4],[27.4,10.6]],(ux,uy,px,py)=>tone(C.main,.84-(ux-7)*.022-(Math.floor(uy/1.7)%2?.16:0),px,py,.06));A.rect(4.6,9.8,22.8,.9,C.main.d);},{outline:C.main.o});},
  lightbulb(P,C){const g=C.pat===1?ramp(C.main.b,{hi:.85}):ramp('#ffe27a',{cool:'#a85a12',hi:.85});P.part(A=>{A.cyl(12.4,15,7.2,4.6,R_STEEL);A.rect(12.4,16.4,7.2,.8,R_STEEL.d);A.rect(12.4,18,7.2,.8,R_STEEL.d);},{outline:R_STEEL.o});
    P.part(A=>{A.ell(16,8.8,7.8,7.6,g,{spec:.3});A.poly([[11.6,13],[20.4,13],[19.4,15.4],[12.6,15.4]],g.s);A.rect(13.8,8.6,1.3,4.2,'#ff8a2a');A.rect(16.9,8.6,1.3,4.2,'#ff8a2a');A.rect(13.8,7.4,4.4,1.3,'#ff8a2a');A.px(15.2,5.4,'#fff6c4',1.6,1.4);},{outline:g.o});},
  // ---- fun
  duck(P,C){const Y=ramp('#ffd23f',{cool:'#a8560c'}),O=ramp('#ff8a2a');P.part(A=>{A.ell(14.6,13.8,8.4,6,Y,{spec:.2});A.over((ux,uy)=>Math.abs(Math.hypot(ux-12.6,uy-14.4)-3.4)<.6&&uy>13&&ux<15.4,Y.s);},{outline:Y.o});
    P.part(A=>{A.poly([[22.6,7.4],[27,8.6],[22.6,10]],O.b);A.px(22.6,8.4,O.d,3.6,.8);},{outline:O.o});
    P.part(A=>{A.ell(19.4,7.6,4.5,4.3,Y,{spec:.25});A.px(20.2,6.2,'#15101f',1.6,1.8);A.px(20.2,6.2,'#ffffff',.8,.8);A.px(18,9.4,'#ff9fb0',1.6,1);},{outline:Y.o});},
  cupcake(P,C){const F=ramp('#ffe3ee',{cool:'#a8567a'});P.part(A=>{A.poly([[9,11.6],[23,11.6],[21.2,19.6],[10.8,19.6]],(ux,uy,px,py)=>tone(C.main,(Math.floor((ux-9)/1.8)%2?.8:.52)-(ux-16)*.015,px,py,.05));A.rect(9,11.6,14,1,C.main.d);},{outline:C.main.o});
    for(const[y,rx,ry]of[[10.6,8.4,3.2],[7.8,6.2,2.8],[5.4,3.8,2.2]])P.part(A=>{A.ell(16,y,rx,ry,F,{spec:.2});A.over((ux,uy)=>uy>y+ry*.35,F.s);},{outline:F.o});
    P.fx(A=>{for(const[x,y,k]of[[11.4,10,'#3fa7d6'],[19.6,10.6,'#f4b730'],[14.4,7.4,'#7bc043'],[18.4,7.6,'#9b7bff'],[16,10.8,'#ff8a3d']])A.px(x,y,k,1.4,.9);});
    P.part(A=>{A.ell(16,2.8,1.9,1.9,R_RED,{spec:.35});A.px(16.6,.6,'#3f8a3a',1,1.4);},{outline:R_RED.o});},
  pineapple(P,C){const Y=ramp('#f2b53a',{cool:'#7a3b10'}),L=R_LEAF_C;P.part(A=>{for(const[a,l]of[[-2.5,5],[-2,6.2],[-1.57,7],[-1.14,6.2],[-.64,5]]){const ex=16+Math.cos(a)*l,ey=7.4+Math.sin(a)*l;A.poly([[14.2,7.6],[17.8,7.6],[ex,ey]],(ux,uy,px,py)=>tone(L,.7-(ux-14)*.06,px,py,.06));}},{outline:L.o});
    P.part(A=>{A.ell(16,13.4,6.8,7.2,Y,{spec:.16});A.over((ux,uy,x,y)=>((x+y)%4===0||(x-y+40)%4===0),Y.d);A.over((ux,uy,x,y)=>((x+y)%4===2&&(x-y+40)%4===2),Y.h);},{outline:Y.o});},
  fishbowl(P,C){const W=ramp('#6fcbee',{cool:'#1a3f7a',hi:.85}),O=ramp('#ff8a2a');P.part(A=>{A.ell(16,11.8,8.8,8,W,{spec:.24});A.over((ux,uy)=>uy<6.6,(old)=>mix(old,'#ffffff',.55));A.over((ux,uy)=>uy>17.2,'#f4e3b3');A.over((ux,uy)=>uy>16.6&&uy<=17.2,'#d9c58a');
      A.px(10.6,15.4,'#3f8a3a',1,2);A.px(11.6,14.4,'#5fb852',1,3);A.px(21.4,9,'#ffffff',1,1);A.px(20.2,7.6,'#ffffff',1,1);},{outline:W.o});
    P.part(A=>{A.poly([[17.6,12.4],[20.2,10.4],[20.2,14.4]],O.s);A.ell(15,12.4,2.9,1.9,O,{spec:.3});A.px(13.4,11.8,'#15101f',1,1);},{outline:O.o});
    P.part(A=>{A.ell(16,4.2,5,1.5,W,{flat:'#e9f8ff'});A.ell(16,4.4,3.8,.8,W,{flat:W.s});},{outline:W.o});},
  pumpkin(P,C){const O=ramp('#f28a1e',{cool:'#6a2408'});P.part(A=>{A.rect(15,1.8,2.4,4,'#5a7a2a');A.px(17,1.4,'#7ba83a',2.4,1.4);},{outline:'#22330f'});
    P.part(A=>{A.ell(16,12.8,9.6,7.2,O,{spec:.16});A.over((ux,uy)=>Math.abs(Math.abs(ux-16)-3.4)<.5||Math.abs(Math.abs(ux-16)-7)<.5,O.s);
      if(C.pat===1){A.poly([[11,9.6],[13.6,9.6],[12.3,7.2]],'#2a1408');A.poly([[18.4,9.6],[21,9.6],[19.7,7.2]],'#2a1408');A.poly([[10.6,13],[21.4,13],[19.6,16.2],[17.8,14.4],[16,16.2],[14.2,14.4],[12.4,16.2]],'#2a1408');A.px(12,8.8,'#ffd34e',.9,.9);A.px(19.4,8.8,'#ffd34e',.9,.9);A.px(15.4,13.6,'#ffd34e',1.2,.9);}},{outline:O.o});},
  rocket(P,C){const W=R_PAPER;P.part(A=>{A.poly([[10.4,13],[6,19.6],[10.4,19.6]],C.main.b);A.poly([[21.6,13],[26,19.6],[21.6,19.6]],C.main.s);},{outline:C.main.o});
    P.part(A=>{A.ell(16,12,5.8,11,W,{clip:(x,y)=>y<19.6,spec:.14});A.over((ux,uy)=>uy<6.2,(old)=>old===W.s||old===W.d?C.main.s:old===W.h||old===W.l?C.main.l:C.main.b);A.over((ux,uy)=>uy>16.4&&uy<17.8,C.main.b);},{outline:W.o});
    P.part(A=>{A.ell(16,11,2.7,2.7,R_STEEL,{flat:R_STEEL.l});A.ell(16,11,1.8,1.8,R_GLASS,{spec:.4});},{outline:R_STEEL.o});},
  candle(P,C){const K=C.pat===1?ramp('#e2413b',{cool:'#4a0f1c'}):ramp('#2fbf71',{cool:'#0c3a2a'});P.part(A=>{A.rect(15.3,1.4,1.4,18.2,K.d);},{outline:K.o});
    P.part(A=>{A.cyl(10.6,5.6,10.8,11.4,K);A.rect(10.6,5.6,10.8,1,K.h);A.rect(10.6,16,10.8,1,K.d);
      const up=C.pat!==1;A.poly(up?[[16,7.2],[20.2,12],[11.8,12]]:[[16,15.4],[20.2,10.6],[11.8,10.6]],PAPERC);A.rect(15,up?12:7.6,2,3.2,PAPERC);},{outline:K.o});},
  ufo(P,C){P.part(A=>{A.ell(16,8.6,5.2,5,R_GLASS,{spec:.3,clip:(x,y)=>y<10.4});A.px(14.6,7,'#2f9e52',2.8,2.6);A.px(14.2,6.4,'#15101f',1,1);A.px(16.8,6.4,'#15101f',1,1);},{outline:'#1d4a66'});
    P.part(A=>{A.ell(16,12.8,11.4,3.6,R_STEEL,{spec:.12});A.over((ux,uy)=>uy>14.2,R_STEEL.d);for(let x=7;x<26;x+=3.6)A.px(x,12.4,C.main.l,1.6,1.4);},{outline:R_STEEL.o});
    P.part(A=>{A.ell(16,16.8,4.6,1.6,R_STEEL,{flat:R_STEEL.d});A.px(14.6,16.4,C.main.h,2.8,.9);},{outline:R_STEEL.o});},
  // ---- rare, finance
  bell(P,C){const g=R_GOLD;P.part(A=>{A.ell(16,2.6,2,2,g,{flat:g.b});A.erase((x,y)=>Math.hypot(x-16,y-2.6)<.9);},{outline:g.o});
    P.part(A=>{A.ell(16,20,1.8,1.5,g,{flat:g.d});},{outline:g.o});
    P.part(A=>{A.ell(16,9.4,7,6.4,g,{clip:(x,y)=>y<9.6,spec:.2});A.poly([[9,9.4],[23,9.4],[25.6,17.4],[6.4,17.4]],(ux,uy,px,py)=>{const half=7+(uy-9.4)/8*2.6;return tone(g,.66-((ux-16)/half)*.46+(Math.abs((ux-16)/half+.5)<.12?.3:0),px,py,.08);});A.rect(9.4,12,13.2,.8,g.s);A.cyl(5.4,17.2,21.2,2.4,g);A.rect(5.4,17.2,21.2,.8,g.h);},{outline:g.o});},
  briefcase(P,C){const l=ramp('#8a4f2a',{cool:'#2a1208'}),g=R_GOLD;P.part(A=>{A.ell(16,6.4,4.4,3.4,l,{flat:l.d});A.erase((x,y)=>((x-16)/2.8)**2+((y-6.6)/2)**2<1);},{outline:l.o});
    P.part(A=>{A.poly([[6,8],[26,8],[26,19.6],[6,19.6]],(ux,uy,px,py)=>tone(l,.8-(uy-8)*.045-(ux>24?.2:0),px,py,.1));A.rect(6,11.6,20,.8,l.d);A.rect(6,8,20,.9,l.l);for(const x of[9,21]){A.rect(x,10.6,2.4,2.8,g.b);A.rect(x,10.6,2.4,.8,g.h);}A.rect(14.6,10.8,2.8,2,g.s);for(const[x,y]of[[6.6,8.6],[24.6,8.6],[6.6,18.2],[24.6,18.2]])A.px(x,y,g.h,1,1);},{outline:l.o});},
  piggy(P,C){const p=ramp('#ff9fc0',{cool:'#7a2a5a'});P.part(A=>{A.poly([[8,7.6],[9,2.6],[13,6]],p.s);A.poly([[24,7.6],[23,2.6],[19,6]],p.s);},{outline:p.o});
    P.part(A=>{A.ell(16,12.2,10.4,7.8,p,{spec:.2});A.rect(13.4,5.4,5.2,1,p.o);A.px(10.6,10.4,'#15101f',1.4,1.6);A.px(20,10.4,'#15101f',1.4,1.6);A.px(10.6,10.4,'#ffffff',.7,.7);A.px(20,10.4,'#ffffff',.7,.7);A.px(25.6,9,p.d,1,1);A.px(26.4,8,p.d,1,1);A.px(27,9.2,p.d,1,1);},{outline:p.o});
    P.fx(A=>{A.ell(16,14.2,3.4,2.3,p,{flat:mix(p.h,'#ffffff',.25)});A.ell(16,15.4,3.4,1.2,p,{flat:p.s,clip:(x,y)=>y>15.6});A.px(14.3,13.6,p.o,1,1.5);A.px(16.9,13.6,p.o,1,1.5);});
    P.part(A=>{A.ell(16,3.6,2,2,R_GOLD,{spec:.3});},{outline:R_GOLD.o});},
  moneybag(P,C){const s=ramp('#c9a86a',{cool:'#4a3212'}),ink='#1f6b3a';P.part(A=>{A.poly([[11,6.4],[9.4,2.4],[13,3.8],[16,1.8],[19,3.8],[22.6,2.4],[21,6.4]],s.l);},{outline:s.o});
    P.part(A=>{A.ell(16,13.2,9.4,7.2,s,{spec:.14});A.over((ux,uy,x,y)=>(x*3+y*7)%13===0,s.s);},{outline:s.o});
    P.part(A=>{A.rect(11.4,6,9.2,1.6,R_RED.b);A.px(20.4,7.4,R_RED.s,1,2.4);},{outline:R_RED.o});
    P.fx(A=>{A.rect(15.3,6.4,1.4,9.6,ink);A.rect(13.2,7.6,5.6,1.4,ink);A.rect(13.2,7.6,1.4,3.4,ink);A.rect(13.2,10.4,5.6,1.4,ink);A.rect(17.4,10.4,1.4,3.6,ink);A.rect(13.2,13.2,5.6,1.4,ink);});},
  // ---- rare
  safe(P,C){const r=R_STEEL;P.part(A=>{A.poly([[7.6,5.6],[22.4,5.6],[22.4,19.6],[7.6,19.6]],r.b);A.poly([[22.4,5.6],[25.8,3],[25.8,16.8],[22.4,19.6]],r.d);A.poly([[7.6,5.6],[11,3],[25.8,3],[22.4,5.6]],r.l);
      A.rect(9,7,12,11.2,r.l);A.rect(9.8,7.8,10.4,9.6,r.b);A.rect(9.8,16.6,10.4,.8,r.s);for(const[x,y]of[[8.2,6.2],[21,6.2],[8.2,18.4],[21,18.4]])A.px(x,y,r.h,1,1);A.rect(21.4,9,1,2.4,r.d);A.rect(21.4,14,1,2.4,r.d);},{outline:r.o});
    P.part(A=>{A.ell(14.2,12.6,3.1,3.1,C.main,{spec:.3});A.px(13.8,12.2,PAPERC,1,1);A.line(14.2,12.6,15.8,11,1,C.main.o);},{outline:r.o});
    P.part(A=>{A.rect(18.2,10.4,1.3,4.6,R_DARK.b);A.px(18,12.2,R_DARK.l,1.7,1.2);},{outline:r.o});},
  chest(P,C){const w=R_WOOD,g=R_GOLD;P.part(A=>{A.ell(16,11.4,9,7.4,w,{clip:(x,y)=>y<11.6});A.over((ux,uy)=>Math.abs(uy-7.6)<.45,w.d);A.rect(7,11.2,18,8.4,w.b);A.rect(7,11.2,18,1,w.d);A.rect(7,15.2,18,.7,w.s);A.rect(7,18.6,18,1,w.s);
      for(const x of[9.4,20.4]){A.over((ux,uy)=>ux>x&&ux<x+2.2,(old)=>old===w.d||old===w.s?g.s:old===w.h||old===w.l?g.h:g.b);}
      A.rect(14.6,10,2.8,3.8,g.b);A.rect(14.6,10,2.8,.8,g.h);A.px(15.6,11.6,g.o,.9,1.5);},{outline:w.o});},
  crown(P,C){const g=R_GOLD;P.part(A=>A.ell(16,12.6,6.6,6,C.main,{clip:(x,y)=>y<14}),{outline:g.o});
    P.part(A=>{for(const[x,h]of[[9,8],[12.6,5.4],[16,3.6],[19.4,5.4],[23,8]]){A.poly([[x-2.1,14],[x+2.1,14],[x,h]],(ux,uy,px,py)=>tone(g,.7-(ux-x)*.22,px,py,.06));A.ell(x,h-.4,1.25,1.25,g,{flat:g.h});}
      A.cyl(8,13.6,16,5.6,g);A.rect(8,13.6,16,.8,g.h);A.rect(8,18.2,16,1,g.s);for(const[x,c]of[[10.2,R_RED],[15.2,R_GLASS],[20.2,R_RED]]){A.rect(x,15.2,1.8,1.9,c.b);A.px(x,15.2,c.h,.9,.9);}},{outline:g.o});},
  // ---- legendary
  tricorn(P,C){const N=ramp('#2c3150',{hi:.4}),G=R_GOLD;P.part(A=>{A.poly([[22,8],[27.6,1.6],[29.6,3.4],[25,10]],(ux,uy,px,py)=>tone(R_RED,.8-(ux+uy-27)*.06,px,py,.05));},{outline:R_RED.o});
    P.part(A=>{A.ell(16,12,7.4,7,N,{clip:(x,y)=>y<12.6,spec:.1});},{outline:N.o});
    P.part(A=>{A.poly([[2.4,15.8],[9,9.4],[16,12.6],[23,9.4],[29.6,15.8],[24.4,19.6],[7.6,19.6]],(ux,uy,px,py)=>tone(N,.74-(uy-9)*.05,px,py,.06));for(const[a,b,c_,d]of[[2.4,15.8,9,9.4],[9,9.4,16,12.6],[16,12.6,23,9.4],[23,9.4,29.6,15.8]])A.line(a,b+.6,c_,d+.6,1.2,G.b);
      A.rect(14.2,14.4,3.6,2.6,PAPERC);A.rect(14.8,17,2.4,1,PAPERC);A.px(14.8,15.2,'#15101f',1,1);A.px(16.4,15.2,'#15101f',1,1);},{outline:N.o});},
  helmet(P,C){const W=R_PAPER;P.part(A=>{A.line(22,4,25.4,.8,1,R_STEEL.b);A.ell(25.8,1,1.3,1.3,R_RED,{flat:R_RED.b});},{outline:'#22303c'});
    P.part(A=>{A.ell(16,10.4,9.4,9.2,R_GLASS,{spec:.3});A.over(()=>true,(old)=>mix(old,'#ffffff',.42));A.over((ux,uy)=>Math.abs(Math.hypot(ux-16,uy-10.4)-6.6)<.5&&ux<13&&uy<11,'#ffffff');A.px(20,14.4,'#ffffff',1.4,1);},{outline:'#1d4a66'});
    P.part(A=>{A.cyl(6.6,17,18.8,2.8,W);A.rect(6.6,17,18.8,.9,W.h);A.px(9,18,R_RED.b,2,1);A.px(12,18,'#3fa7d6',2,1);},{outline:W.o});},
  horns(P,C){const I_=ramp('#f1e6c8',{cool:'#6b4a1e'}),Lr=ramp('#5a3a22');for(const s of[-1,1]){const f=s<0?(x=>x):mx;P.part(A=>{A.poly([[f(9),16],[f(3.4),12.4],[f(2.4),5],[f(4.6),1.6],[f(6),7.6],[f(11),12]],(ux,uy,px,py)=>tone(I_,.86-(uy-2)*.035-(s<0?0:.12),px,py,.06));A.poly([[f(2.8),4.6],[f(4.6),1.6],[f(5.4),4.6]],R_GOLD.b);},{outline:I_.o});}
    P.part(A=>{A.ell(16,15.4,8.4,6,Lr,{clip:(x,y)=>y<19.6,spec:.1});A.rect(8,17.6,16,1.2,R_GOLD.b);for(let x=9;x<23;x+=3)A.px(x,17.8,R_GOLD.h,1,.8);},{outline:Lr.o});},
  lantern(P,C){const Ir=R_DARK,Gl=ramp('#c9ff9a',{cool:'#1f6b4a',hi:.9});P.part(A=>{A.ell(16,3.4,3,2.6,Ir,{flat:Ir.b});A.erase((x,y)=>((x-16)/1.8)**2+((y-3.6)/1.5)**2<1);},{outline:Ir.o});
    P.part(A=>{A.cyl(10.4,7.4,11.2,10,Gl);A.ell(16,12.4,2,2.8,Gl,{flat:'#ffffff'});for(const x of[10.4,15.5,20.6])A.rect(x,7.4,1,10,Ir.b);},{outline:Ir.o});
    P.part(A=>{A.poly([[9,7.6],[12.4,4.6],[19.6,4.6],[23,7.6]],Ir.l);A.rect(8.6,17.2,14.8,2.4,Ir.b);A.rect(8.6,17.2,14.8,.8,Ir.l);},{outline:Ir.o});},
  kingcrown(P,C){const g=R_GOLD,V=ramp('#b3202c');P.part(A=>A.ell(16,11.4,8,7.4,V,{clip:(x,y)=>y<14.6,spec:.12}),{outline:V.o});
    P.part(A=>{for(const x of[8.4,16,23.6])A.poly([[x-1.6,14.6],[x+1.6,14.6],[x,5.4]],(ux,uy,px,py)=>tone(g,.75-(ux-x)*.2,px,py,.05));A.line(8.4,6,16,3.4,1.4,g.b);A.line(16,3.4,23.6,6,1.4,g.b);A.rect(15.3,.4,1.4,3.4,g.h);A.rect(14.2,1.4,3.6,1.3,g.h);for(const[x,k]of[[8.4,'#3fa7d6'],[16,'#2fbf71'],[23.6,'#3fa7d6']])A.px(x-.9,8.4,k,1.8,1.8);},{outline:g.o});
    P.part(A=>{A.cyl(6.4,14.4,19.2,5.2,R_PAPER);for(let x=8;x<25;x+=3.2)A.px(x,16+((x*3)%2),'#15101f',1.2,1.6);},{outline:R_PAPER.o});},
  goldbars(P,C){const g=R_GOLD,bar=(A,x,y)=>{A.poly([[x+1.4,y],[x+10.4,y],[x+11.8,y+1.6],[x,y+1.6]],g.h);A.poly([[x,y+1.6],[x+11.8,y+1.6],[x+12.6,y+5],[x-.8,y+5]],(ux,uy,px,py)=>tone(g,.66-(ux-x)*.035,px,py,.08));A.rect(x+3.4,y+2.7,4.6,1,g.s);A.px(x+1.8,y+.4,'#ffffff',1.6,.8);};
    P.part(A=>{bar(A,3.6,14.6);bar(A,15.6,14.6);},{outline:g.o});P.part(A=>bar(A,9.6,9.2),{outline:g.o});P.part(A=>bar(A,9.8,3.8),{outline:g.o});},
  crystal(P,C){const c=ramp('#5ee6ff',{cool:'#3a1d8a',hi:.8}),shard=(A,x,w,top,lean)=>{const b=19.6,tx=x+w/2+lean;A.poly([[x,b],[x+w/2,b],[tx,top+3],[x+lean*.6,top+4.2]],c.l);A.poly([[x+w/2,b],[x+w,b],[x+w+lean*.6,top+4.2],[tx,top+3]],c.s);A.poly([[x+lean*.6,top+4.2],[tx,top+3],[tx,top]],c.h);A.poly([[tx,top+3],[x+w+lean*.6,top+4.2],[tx,top]],c.b);};
    P.part(A=>shard(A,5,6,8.5,-1.6),{outline:c.o});P.part(A=>shard(A,20,6.4,7,1.8),{outline:c.o});P.part(A=>shard(A,11,9.4,1,.4),{outline:c.o});P.part(A=>shard(A,8.4,4.6,11.5,-.4),{outline:c.o});P.part(A=>shard(A,18.4,4.4,12.4,.4),{outline:c.o});},
  pearl(P,C){const s=ramp('#ff9ec4',{hi:.7}),p=ramp('#f7f3ff',{cool:'#6d5fa8'});
    P.part(A=>{A.ell(16,19.4,12,17,s,{clip:(x,y)=>y<19.6,spec:.15});for(let k=-4;k<=4;k++){const a=-Math.PI/2+k*.34;A.line(16,19.4,16+Math.cos(a)*17,19.4+Math.sin(a)*17,1,(ux,uy,px,py)=>A.get(px,py)?s.s:null);}
      A.ell(16,19.6,7.6,10.4,s,{clip:(x,y)=>y<19.6,flat:s.d});A.ell(16,19.6,6.8,9.6,p,{clip:(x,y)=>y<19.6,flat:mix(s.l,'#ffffff',.55)});},{outline:s.o});
    P.part(A=>{A.ell(16,14.4,4,4,p,{spec:.34});},{outline:p.o});},
  diver(P,C){const b=R_BRASS;P.part(A=>{A.rect(8.6,16.8,14.8,3,b.s);A.rect(8.6,16.8,14.8,.9,b.l);for(let x=9.6;x<23;x+=2.6)A.px(x,18.2,b.h,1,1);},{outline:b.o});
    P.part(A=>{A.ell(16,9.8,9.6,9,b,{spec:.2});A.rect(14.8,.2,2.4,1.4,b.l);},{outline:b.o});
    P.part(A=>{A.ell(6.4,10,1.9,2.6,b,{flat:b.s});A.ell(6.2,10,1,1.6,R_GLASS,{flat:R_GLASS.d});A.ell(25.6,10,1.9,2.6,b,{flat:b.d});},{outline:b.o});
    P.part(A=>{A.ell(16,10.6,5.6,5.6,b,{flat:b.l});for(let k=0;k<8;k++){const a=k*Math.PI/4+.39;A.px(16+Math.cos(a)*4.9-.5,10.6+Math.sin(a)*4.9-.5,b.o,1,1);}A.ell(16,10.6,3.9,3.9,R_GLASS,{spec:.3,dark:.12});},{outline:b.o});},
  hood(P,C){const g=ramp('#1f7a3e',{cool:'#0a2326'}),b=ramp('#63c774',{cool:'#0f3a2a'}),f=R_RED;
    P.part(A=>{A.poly([[20.6,9.4],[27.2,1.6],[29.4,3.4],[23.4,11.6]],(ux,uy,px,py)=>tone(f,.8-(ux+uy-27)*.07,px,py,.06));A.line(21.6,10.2,28.2,2.6,1,f.h);A.px(27.4,1.4,PAPERC,1.8,1.8);},{outline:f.o});
    P.part(A=>{A.poly([[9,16],[12.4,7.6],[18.6,4.4],[25,8.4],[27.6,16]],(ux,uy,px,py)=>tone(g,.9-(ux-10)*.035-(uy-4)*.02,px,py,.1));A.line(12.4,7.6,20,12,1,g.d);},{outline:g.o});
    P.part(A=>{A.poly([[1,17.2],[9.4,13],[27.6,13.2],[29.6,16.2],[27,19.4],[9.4,19.4]],(ux,uy,px,py)=>tone(b,.95-(uy-13)*.1,px,py,.08));A.px(2.4,16.6,b.h,4,1);A.px(12,14,b.h,8,1);},{outline:g.o});},
};
const SHELL_LIST=[['turret',12],['snail',12],['conch',10],['scallop',9],['can',9],['tophat',6],['teacup',7],['dice',6],['box',5],['coconut',6],['cone',5],['mushroom',8],['acorn',5],['flowerpot',6],['partyhat',6],['house',5],['lightbulb',5],['duck',6],['cupcake',6],['pineapple',5],['fishbowl',5],['pumpkin',5],['rocket',4],['candle',4],['ufo',3],['skull',4],['safe',3],['chest',3],['bell',3],['briefcase',3],['piggy',2],['moneybag',2],['crown',2]];
const SHELL_META={turret:{main:1,alt:1},snail:{main:1,pats:['plain','spotted'],altIf:[1]},conch:{main:1,alt:1},scallop:{main:1,alt:1,pats:['ribbed','banded']},
  can:{main:1,pats:['stripe label','fish label','barcode label'],altIf:[2]},tophat:{main:1},teacup:{main:1,pats:['banded','striped']},dice:{main:1},box:{main:1,pats:['taped','fragile sticker','gift wrap'],altIf:[2]},
  coconut:{pats:['whole','cracked','cocktail'],mainIf:[2]},cone:{main:1},mushroom:{main:1},acorn:{pats:['plain','with a leaf']},flowerpot:{pats:['terracotta, sprout','terracotta, flower','glazed, sprout','glazed, cactus','painted band, flower'],mainIf:[2,3,4]},
  partyhat:{main:1,alt:1},house:{main:1},lightbulb:{pats:['classic','coloured'],mainIf:[1]},skull:{pats:['plain','cracked','gold tooth']},safe:{main:1},chest:{},bell:{},briefcase:{},piggy:{},moneybag:{},crown:{main:1},duck:{},cupcake:{main:1},pineapple:{},fishbowl:{},pumpkin:{pats:['plain','carved']},rocket:{main:1},candle:{pats:['green, up','red, down']},ufo:{main:1}};
function normalise(t){const M=SHELL_META[t.shell]||{},n=(M.pats||[0]).length;t.pat=(t.pat||0)%n;if(!(M.main||(M.mainIf||[]).includes(t.pat)))t.shellColor=null;if(!(M.alt||(M.altIf||[]).includes(t.pat)))t.altColor=null;
  if(t.extra==='monocle'&&['shades','wink','sleepy','happy'].includes(t.eyes))t.extra='none';if((t.extra==='pipe'||t.extra==='lollipop'||t.extra==='daisy')&&(t.mouth==='grin'||t.mouth==='tongue'))t.mouth='smile';return t;}
const LEGENDARY=['goldbars','crystal','pearl','diver','hood','tricorn','helmet','horns','lantern','kingcrown'];
const SHELL_NAMES={turret:'turret shell',snail:'snail shell',conch:'spiked conch',scallop:'scallop',can:'tin can',tophat:'top hat',teacup:'teacup',dice:'lucky die',box:'cardboard box',coconut:'coconut',cone:'traffic cone',skull:'skull',safe:'safe',chest:'treasure chest',crown:'crown',duck:'rubber duck',cupcake:'cupcake',pineapple:'pineapple',fishbowl:'fish bowl',pumpkin:'pumpkin',rocket:'rocket',candle:'market candle',ufo:'flying saucer',mushroom:'mushroom cap',acorn:'acorn',flowerpot:'flower pot',partyhat:'party hat',house:'beach house',lightbulb:'light bulb',bell:'opening bell',briefcase:'briefcase',piggy:'piggy bank',moneybag:'money bag',goldbars:'gold reserve',crystal:'crystal',pearl:'the pearl',diver:'diving helmet',hood:"the outlaw's hat",tricorn:"the captain's hat",helmet:'space helmet',horns:"the bull's horns",lantern:'ghost lantern',kingcrown:"the king's crown"};
const SHELL_COLORS=[['coral','#ff6b57'],['teal','#25c2b0'],['violet','#9b7bff'],['sky','#4aa8ff'],['rose','#ff7fb0'],['lime','#8fd63f'],['amber','#ffab24'],['mint','#5fdc9f'],['crimson','#d8334a'],['cream','#f1dfb8']];
const BODY_COLORS=[['berry','#e0559a',4],['lemon','#efc53a',3],['ember','#f0673a',10],['sand','#e9b877',6],['rose','#f48fa0',5],['tide','#5b9bd8',4],['kelp','#5fb878',3],['plum','#9a6fd0',3],['ghost','#e8edf5',1]];
const EYES=[['plain',10],['big',7],['happy',5],['sleepy',4],['angry',3],['shades',3],['money',2]];
const MOUTHS=[['smile',10],['cat',5],['grin',4],['tongue',3],['ooh',2],['flat',2]];
const CLAWS=[['even',8],['big left',4],['big right',4],['both big',2],['small',3]];
const MARKS=[['none',9],['pale belly',4],['striped claws',4],['spotted claws',3],['dark tips',3],['barnacles',2]];
const EXTRAS=[['none',12],['moustache',3],['daisy',3],['lollipop',2],['pipe',2],['monocle',2],['scarf',3],['bandaid',2]];
const HELD=[['nothing',12],['coin',3],['key',2],['drink',2]];

const FIT={turret:['env',8.6],snail:['env',8.6],conch:['env',8.4],scallop:['env',9.6],can:['env',6.6,'steel'],dice:['env',6.2],box:['env',6.4,'card'],coconut:['env',8.8,'paper'],acorn:['env',6.8,'#d19a4e'],
  flowerpot:['env',8.4,'pot'],house:['env',6.8,'paper'],safe:['env',6.8,'steel'],chest:['env',8,'wood'],bell:['env',9.2,'gold',1.6],briefcase:['env',8.8,'#8a4f2a'],piggy:['env',8,'#ff9fc0'],moneybag:['env',7.6,'#c9a86a'],pumpkin:['env',8.2,'#f28a1e'],
  crystal:['env',8.8,'#5ee6ff'],pearl:['env',9,'#ff9ec4'],diver:['env',6.8,'#c98d3a'],
  tophat:['hat',0,0,1.2],teacup:['hat',0,0,1],cone:['hat',0,0,1],mushroom:['hat',0,0,4.8],partyhat:['hat',0,0,1.4],lightbulb:['hat',0,0,1],skull:['hat',0,0,1.4],crown:['hat',0,0,1],duck:['hat',0,0,1.2],cupcake:['hat',0,0,1.2],
  pineapple:['hat',0,0,1.2],fishbowl:['hat',0,0,1.4],rocket:['hat',0,0,1.2],candle:['hat',0,0,1.2],ufo:['float'],goldbars:['hat',0,0,1],hood:['hat',0,0,1],tricorn:['hat',0,0,1],helmet:['hat',0,0,1.6],horns:['hat',0,0,1.4],lantern:['hat',0,0,1.2],kingcrown:['hat',0,0,1]};
// ---- the crab. Big face, big eyes, stubby feet, claws resting low and wide; the shell is painted smaller behind it so the face leads.
const SK=.9,EYE_X=[12.3,19.7],EYE_Y=22.1;
function drawCrab(P,t){
  const B=t.bodyRamp,C={main:t.shellRamp,alt:t.altRamp,pat:t.pat||0},INK='#15101f',G=R_GOLD,PINK=mix(B.l,'#ff8fa0',.6);
  const DY={crown:1.8,hood:1.6,tophat:1.4,goldbars:1.2,skull:-1.4,flowerpot:2.6,acorn:2.2,bell:2.6,pineapple:3.4,cupcake:2.4,candle:1.6,rocket:1.6,helmet:.6,kingcrown:1.8};
  const rest=!!t.asleep,RY=rest?32:0; // asleep needs a 64-unit painter: the crab dozes beside its empty shell
  const shell=(ox,oy,door)=>{const Q=Painter(P.S*SK,32);Q.shift(0,DY[t.shell]??1);SHELLS[t.shell](Q,C);Q.shift(0,0);
    if(door)Q.part(A=>{A.ell(16,20.6,5.6,4.6,C.main,{flat:'#1a1224',clip:(x,y)=>y<20.8});A.ell(14.4,19.4,1.6,1.2,C.main,{flat:'#3a2a44'});},{outline:C.main.o});P.stamp(Q,ox,oy);};
  if(rest){P.part(A=>{A.ell(16,30+RY,11,1.4,B,{flat:'rgba(40,25,10,.3)'});A.ell(46,29.4+RY,10,1.3,B,{flat:'rgba(40,25,10,.3)'});});shell(31.6,RY+9.6,true);P.shift(0,RY);}
  const fit=FIT[t.shell]||['hat',0,0,1],lipR=!fit[2]?C.main:fit[2]==='steel'?R_STEEL:fit[2]==='card'?(C.pat===2?C.main:R_CARD):fit[2]==='paper'?R_PAPER:fit[2]==='wood'?R_WOOD:fit[2]==='gold'?R_GOLD:fit[2]==='pot'?(C.pat>=2?C.main:ramp('#cf6f3e')):ramp(fit[2]);
  if(!rest){if(t.shadow)P.part(A=>A.ell(16,30,11.5,1.4,B,{flat:t.shadow}));shell(1.6,.4+(fit[3]||0),false);
    if(fit[0]==='env')P.part(A=>{A.ell(16,19.6,fit[1],3,B,{flat:'#1a1224'});},{outline:'#120a1c'});
    if(fit[0]==='float')P.fx(A=>{A.poly([[12.6,15.6],[19.4,15.6],[22,19.4],[10,19.4]],(ux,uy,x,y)=>(x+y)%2?'#fff6b0':null);});}
  // stubby feet, three a side, tucked under the body
  for(const s of[-1,1]){const f=s<0?(x=>x):mx;for(const[x,y,rx,ry,col]of[[6.8,27.2,1.9,1.2,B.s],[8.8,28.8,1.9,1.2,B.b],[11.6,29.6,1.8,1.1,B.b]])P.part(A=>{A.ell(f(x),y,rx,ry,B,{flat:col});A.px(f(x)-(s<0?1:0),y-.9,B.l,1,1);},{outline:B.o});}
  // arms
  const big=s=>t.claws==='both big'||(s<0?t.claws==='big left':t.claws==='big right'),lift=s=>t.wave&&s>0?4.4:0;
  P.part(A=>{for(const s of[-1,1]){const f=s<0?(x=>x):mx;A.line(f(8.6),23.4,f(5.6),22.6-lift(s),2,B.b);}},{outline:B.o});
  // body
  P.part(A=>{A.ell(16,23.6,8.8,5.8,B,{spec:.1,dither:.05});A.over((ux,uy)=>uy>27.9,B.s);
    if(t.mark==='pale belly'){const pale=mix(B.h,'#ffffff',.35);A.over((ux,uy)=>uy>25.6&&Math.abs(ux-16)<6.6-(uy-25.6)*.9,(old)=>old===B.s||old===B.d?B.l:pale);}
    if(t.mark==='barnacles')for(const[x,y]of[[8.4,21],[22.2,26.6]]){A.px(x,y,PAPERC,2,2);A.px(x+.5,y+.5,B.o,1,1);}
    A.px(8.6,24.8,PINK,2.2,1.2);A.px(21.2,24.8,PINK,2.2,1.2);},{outline:B.o});
  if(!rest&&fit[0]==='env')P.part(A=>{const rx=fit[1];A.ell(16,20.3,rx,3,lipR,{flat:lipR.b,clip:(x,y)=>y<19.3});A.erase((x,y)=>((x-16)/(rx-1.7))**2+((y-20.6)/2.2)**2<1);A.over((ux,uy)=>uy<18.3,lipR.l);},{outline:lipR.o});
  // claws: rounded pincers, open upward and a little outward
  const claw=s=>{const f=s<0?(x=>x):mx,bg=big(s),rx=bg?3.8:3.1,ry=bg?4.4:3.5,cx=bg?5.8:4.6,cy=(bg?20.8:21.8)-lift(s)+(rest?.8:0);
    P.part(A=>{const ccx=f(cx);A.ell(ccx,cy,rx,ry,B,{spec:.22,dither:.05});
      if(t.mark==='striped claws')A.over((ux,uy)=>Math.floor((uy-cy+ry)/1.5)%2===1,(old)=>old===B.h||old===B.l?B.s:B.d);
      if(t.mark==='spotted claws')for(const[dx,dy]of[[-1.8,-1],[1,.4],[-.8,1.8],[1.2,-2.2],[-2,1.2]])A.px(ccx+dx,cy+dy,PAPERC,1,1);
      if(t.mark==='dark tips')A.over((ux,uy)=>uy<cy-ry*.1,(old)=>old===B.h||old===B.l?mix(B.d,'#15101f',.55):mix(B.d,'#15101f',.75));
      if(t.mark==='barnacles'&&s<0){A.px(ccx-1.6,cy+.4,PAPERC,2,2);A.px(ccx-1.1,cy+.9,B.o,1,1);}
      const ax=f(cx+.2),ay=cy+.4,l=f(cx-1.6),r=f(cx+1.4),lo=Math.min(l,r),hi=Math.max(l,r);
      A.erase((x,y)=>{if(y>ay)return false;const k=(ay-y)/(ry+1.2);return x>=ax+(lo-ax)*k&&x<=ax+(hi-ax)*k;});},{outline:B.o});};
  if(t.claws==='small')P.part(A=>{for(const s of[-1,1]){const f=s<0?(x=>x):mx;A.ell(f(5.4),22.8-lift(s),2.2,2.4,B,{spec:.2});}},{outline:B.o});else{claw(-1);claw(1);}
  // face
  const bigE=t.eyes==='big'||t.eyes==='heart',er=bigE?3.3:2.9,ey=EYE_Y-(bigE?.2:0);
  const shut=s=>rest||t.eyes==='closed'||(t.eyes==='wink'&&s>0);
  EYE_X.forEach((x,k)=>{const s=k?1:-1;
    if(t.eyes==='happy'&&!rest){P.fx(A=>{A.px(x-2,ey,INK,1,1.2);A.px(x-1,ey-1,INK,1,1);A.px(x,ey-1.6,INK,1,1);A.px(x+1,ey-1,INK,1,1);A.px(x+2,ey,INK,1,1.2);});return;}
    if(t.eyes==='patch'&&s>0&&!rest){P.fx(A=>{A.line(x-3.4,ey-3.4,x+4.6,ey-1.6,1,INK);});P.part(A=>{A.ell(x,ey,er,er,R_DARK,{flat:INK});A.px(x-1.4,ey-1.4,'#3a3f5c',1.4,1);},{outline:'#0a0712'});return;}
    if(shut(s)){P.fx(A=>{A.px(x-2,ey-.4,INK,1,1);A.px(x-1.2,ey+.4,INK,2.6,1);A.px(x+1.4,ey-.4,INK,1,1);});return;}
    P.part(A=>{A.ell(x,ey,er,er,R_PAPER,{flat:PAPERC});
      if(t.eyes==='money'){A.ell(x,ey,er,er,G,{spec:.3});A.px(x-.5,ey-1.8,G.o,1,3.6);}
      else if(t.eyes==='heart'){const H='#e2413b';A.px(x-2,ey-1.4,H,1.8,1.6);A.px(x+.2,ey-1.4,H,1.8,1.6);A.px(x-2,ey,H,4,1.2);A.px(x-1.2,ey+1,H,2.4,1);A.px(x-.5,ey+1.8,H,1,1);A.px(x-1.6,ey-1,'#ff9f9a',1,1);}
      else{const px_=x-1.5-s*.5;A.px(px_,ey-1.5,INK,3,3.4);A.px(px_,ey-1.5,'#ffffff',1.3,1.3);A.px(px_+1.9,ey+.9,'#9fb0ff',1,1);}
      if(t.eyes==='sleepy'){A.over((ux,uy)=>uy<ey-.1,B.b);A.over((ux,uy)=>uy>=ey-.1&&uy<ey+.8,B.o);}},{outline:B.o});
    if(t.eyes==='angry')P.fx(A=>A.line(x+s*2.8,ey-4,x-s*1.6,ey-2.2,1.6,INK));});
  if(t.eyes==='shades'&&!rest)P.part(A=>{A.rect(8.6,20.2,14.8,3.8,INK);A.erase((x,y)=>x>15.2&&x<16.8&&y>21.6);A.px(9.8,21,'#7f8df0',2.2,1);A.px(17.6,21,'#7f8df0',2.2,1);},{outline:'#0a0712'});
  // mouth
  const m=rest?'ooh':t.extra==='scarf'?'none':(t.mouth||'smile');
  P.fx(A=>{if(m==='smile'){A.px(14,26,INK,1,1);A.px(15,26.8,INK,2,1);A.px(17,26,INK,1,1);}
    if(m==='grin'){A.rect(14,25.8,4,2,INK);A.px(14.8,26.9,'#ff7a90',2.4,.9);A.px(14,25.8,PAPERC,4,.7);}
    if(m==='cat'){A.px(13.6,26,INK,1,1);A.px(14.6,26.8,INK,1,1);A.px(15.6,26,INK,1,1);A.px(16.6,26.8,INK,1,1);A.px(17.6,26,INK,1,1);}
    if(m==='tongue'){A.px(14,26,INK,1,1);A.px(15,26.8,INK,2,1);A.px(17,26,INK,1,1);A.px(15.6,27.6,'#ff7a90',1.6,1.4);}
    if(m==='ooh'){A.rect(15.2,26,1.6,1.7,INK);}
    if(m==='flat'){A.rect(14.4,26.4,3.2,.9,INK);}});
  // accessories
  const NAVY=ramp('#2b3358');
  if(t.extra==='daisy'){P.part(A=>{A.line(14.6,26.8,10.8,28.4,1,'#3f8a3a');A.px(12.2,26.8,'#5fb852',1.6,1);},{outline:'#1d3a1c'});P.part(A=>{for(let k=0;k<5;k++){const a=k*1.2566-1.57;A.ell(8.4+Math.cos(a)*2,28.8+Math.sin(a)*2,1.25,1.25,R_PAPER,{flat:'#ff9fc0'});}},{outline:'#8a2a5a'});P.part(A=>A.ell(8.4,28.8,1.2,1.2,R_GOLD,{flat:'#ffd34e'}),{outline:'#a8560c'});}
  if(t.extra==='scarf'){const SC=ramp('#e2413b');P.part(A=>{A.poly([[8.2,26.6],[23.8,26.6],[22.8,29],[9.2,29]],(ux,uy,px,py)=>tone(SC,.78-(uy-26.6)*.14,px,py,.05));A.px(12,27.4,SC.d,1,1.4);A.px(17,27.2,SC.d,1,1.6);},{outline:SC.o});P.part(A=>{A.poly([[19.6,28],[23,28],[24.2,31.2],[21,31.2]],SC.s);A.rect(19.4,27.2,3,1.8,SC.l);},{outline:SC.o});}
  if(t.extra==='moustache')P.fx(A=>{A.rect(12.6,24.8,3,1.1,'#3a2416');A.rect(16.4,24.8,3,1.1,'#3a2416');A.px(11.8,25.6,'#3a2416',1,1);A.px(19.2,25.6,'#3a2416',1,1);});
  if(t.extra==='monocle'&&!['shades','wink','sleepy','happy','closed'].includes(t.eyes)&&!rest)P.fx(A=>{const x=EYE_X[1];for(let a=0;a<6.3;a+=.18)A.px(x+Math.cos(a)*(er+1.1)-.5,ey+Math.sin(a)*(er+1.1)-.5,G.b,1,1);A.px(x+er+.4,ey+er+.6,G.s,1,1);A.px(x+er+.8,ey+er+1.6,G.b,1,1);A.px(x+er+.8,ey+er+2.6,G.s,1,1);});
  if(t.extra==='bandaid')P.fx(A=>{const bx=big(-1)?3.4:2.8,by=t.claws==='small'?22.4:21.8;A.rect(bx,by,4,1.8,'#f3d2ae');A.px(bx+1.5,by+.4,'#c99a6e',1,1);A.px(bx,by,'#fbe6cc',4,.7);});
  if(t.extra==='lollipop'){P.part(A=>A.line(17.4,26.8,22.2,28.8,1,PAPERC),{outline:INK});P.part(A=>{A.ell(23.8,29.2,2.3,2.3,R_RED,{spec:.25});A.over((ux,uy)=>Math.floor((Math.atan2(uy-29.2,ux-23.8)+3.2)*1.3+Math.hypot(ux-23.8,uy-29.2)*.9)%2===0,PAPERC);},{outline:R_RED.o});}
  if(t.extra==='pipe'){P.part(A=>{A.line(17.4,26.8,21.6,28.4,1.2,R_WOOD.d);A.rect(21.4,26.2,3,3.2,R_WOOD.b);A.rect(21.4,26.2,3,.9,R_WOOD.l);},{outline:R_WOOD.o});P.fx(A=>{A.px(23,24.2,'#e8edf5',1,1);A.px(24,22.6,'#e8edf5',1,1);});}
  // held in the right claw
  const hb=big(1),hx=mx(hb?5.8:4.6),hy=t.claws==='small'?20.4:hb?16.4:18.4;
  if(t.held==='coin')P.part(A=>{A.ell(hx,hy-2.6,2.3,2.3,G,{spec:.3});A.px(hx-.4,hy-3.6,G.s,.9,2);},{outline:G.o});
  if(t.held==='key')P.part(A=>{A.ell(hx,hy-6.4,2,2,G,{spec:.3});A.erase((x,y)=>Math.hypot(x-hx,y-(hy-6.4))<.8);A.rect(hx-.5,hy-4.6,1.1,4.4,G.b);A.rect(hx+.5,hy-2.4,1.4,.9,G.s);A.rect(hx+.5,hy-.9,1.4,.9,G.s);},{outline:G.o});
  if(t.held==='drink')P.part(A=>{A.poly([[hx-3,hy-7.4],[hx+3,hy-7.4],[hx,hy-3.6]],R_GLASS.l);A.poly([[hx-2,hy-6.4],[hx+2,hy-6.4],[hx,hy-3.8]],'#ff7a59');A.rect(hx-3,hy-7.4,6,.9,R_PAPER.b);A.rect(hx-.5,hy-3.8,1,2.6,R_GLASS.h);A.rect(hx-1.8,hy-1.4,3.6,.9,R_GLASS.h);},{outline:INK});
  if(rest)P.shift(0,0);
}
function rnd(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function wpick(r,arr){const tot=arr.reduce((a,b)=>a+b[b.length-1],0);let v=r()*tot;for(const a of arr){v-=a[a.length-1];if(v<=0)return a;}return arr[0];}
function rollTraits(r){const shell=wpick(r,SHELL_LIST)[0];let sc=SHELL_COLORS[Math.floor(r()*SHELL_COLORS.length)],ac=SHELL_COLORS[Math.floor(r()*SHELL_COLORS.length)];const body=wpick(r,BODY_COLORS);
  if(mixDist(sc[1],body[1])<70)sc=SHELL_COLORS[(SHELL_COLORS.indexOf(sc)+3)%SHELL_COLORS.length];
  if(ac===sc||r()<.6)ac=['cream','#f1dfb8'];if(sc[0]==='cream')ac=SHELL_COLORS[Math.floor(r()*8)];
  return normalise({shell,pat:Math.floor(r()*60),shellColor:sc,altColor:ac,body,eyes:wpick(r,EYES)[0],claws:wpick(r,CLAWS)[0],held:wpick(r,HELD)[0],mouth:wpick(r,MOUTHS)[0],mark:wpick(r,MARKS)[0],extra:wpick(r,EXTRAS)[0],scene:pickScene(r,body[0])});}
const CLASH={tide:['noon','reef','dusk','night'],rose:['dawn'],kelp:['reef'],ghost:['fog','dawn'],sand:['fog'],plum:['sunset']};
function pickScene(r,body){for(let k=0;k<8;k++){const s=wpick(r,SCENES)[0];if(!(CLASH[body]||[]).includes(s))return s;}return'storm';}
function mixDist(a,b){const A=hex(a),B=hex(b);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);}
function legendTraits(name){const L={goldbars:{body:['gold','#f4b730'],scene:'vault',eyes:'big',claws:'both big',held:'nothing',extra:'none',mark:'none'},crystal:{body:['plum','#9a6fd0'],scene:'aurora',eyes:'big',claws:'even',held:'nothing'},pearl:{body:['rose','#f48fa0'],scene:'deep',eyes:'big',claws:'small',held:'nothing'},diver:{body:['ember','#f0673a'],scene:'wreck',eyes:'plain',claws:'big left',held:'nothing'},tricorn:{body:['ember','#f0673a'],scene:'ship',eyes:'patch',claws:'big right',held:'coin',mouth:'grin',extra:'none',mark:'none'},helmet:{body:['ghost','#e8edf5'],scene:'space',eyes:'big',claws:'even',held:'nothing',mouth:'ooh',extra:'none',mark:'none'},horns:{body:['ember','#f0673a'],scene:'bullrun',eyes:'angry',claws:'both big',held:'nothing',mouth:'grin',extra:'none',mark:'dark tips'},lantern:{body:['ghost','#e8edf5'],scene:'haunted',eyes:'happy',claws:'small',held:'nothing',mouth:'ooh',extra:'none',mark:'none'},kingcrown:{body:['plum','#9a6fd0'],scene:'throne',eyes:'plain',claws:'even',held:'coin',mouth:'smile',extra:'moustache',mark:'pale belly'},hood:{body:['sand','#e9b877'],scene:'sherwood',eyes:'angry',claws:'big right',held:'coin',extra:'moustache'}}[name];
  return{shell:name,shellColor:['legend','#f4b730'],altColor:['cream','#f1dfb8'],legendary:true,...L};}
function resolve(t){return{...t,bodyRamp:t.body[0]==='gold'?R_GOLD:ramp(t.body[1]),shellRamp:ramp((t.shellColor||['','#f1dfb8'])[1]),altRamp:ramp((t.altColor||['','#f1dfb8'])[1])};}

// ---- backdrops (32×32)
const SCENES=[['sky',8],['mint',8],['peach',8],['lilac',7],['butter',7],['rose',7],['aqua',7],['cream',5],['navy',4],['sunset',2],['night',2],['noon',2],['storm',1]];
const FLAT={sky:'#8fd3ff',mint:'#a5ecd0',peach:'#ffc7a3',lilac:'#cbb6ff',butter:'#ffe58f',rose:'#ffb0c6',aqua:'#79dede',cream:'#f1e6cf',navy:'#2a3a6b'};
const SCENE_DEF={...Object.fromEntries(Object.entries(FLAT).map(([k,v])=>[k,{sky:[v,v],sea:[v,v],sand:'#f4e3b3'}])),dusk:{sky:['#1b2a4e','#3b4f86'],sea:['#21508a','#2f6fb0'],sand:'#e6cf9a'},noon:{sky:['#4fb2e8','#9fdcf5'],sea:['#1f86c9','#38a6e0'],sand:'#f3e3b0'},sunset:{sky:['#4a2359','#f2784b'],sea:['#7a3560','#c95a55'],sand:'#e9c08a',sun:'#ffd27a'},night:{sky:['#0a1026','#1a2850'],sea:['#0f2347','#1b3a6b'],sand:'#9fa6b8',stars:1,moon:'#f1ecd4'},dawn:{sky:['#f7a8a0','#ffe2b8'],sea:['#5a86b8','#8fb4d6'],sand:'#f2dcb0',sun:'#fff3c4'},reef:{sky:['#37c6c0','#a8f0dc'],sea:['#119c9c','#3fd0c0'],sand:'#fbeec8'},fog:{sky:['#9aa7ad','#d3dbdc'],sea:['#7d939c','#a3b7bd'],sand:'#ddd3b8'},storm:{sky:['#2a3140','#566072'],sea:['#2c4a5c','#3f6678'],sand:'#c9bd9b',rain:1},
  vault:{sky:['#2a1a05','#7a4d0c'],sea:['#a0690f','#d99a1f'],sand:'#f6d469',rays:1},aurora:{sky:['#071226','#0f2b45'],sea:['#0c2f4a','#14506b'],sand:'#a9b8c9',stars:1,aurora:1},deep:{sky:['#04263f','#0a4a6e'],sea:['#0a4a6e','#0f6488'],sand:'#c8d6b0',bubbles:1},sherwood:{sky:['#12351f','#2f6b35'],sea:['#1f5a2c','#3b8240'],sand:'#d8c98e',trees:1}};
function drawScene(ctx,name,seed,frame=0,W=32){if(SCENE_CUSTOM[name])return SCENE_CUSTOM[name](ctx,seed,frame);
  if(FLAT[name]){const c=FLAT[name],sand=name==='navy'?'#d9c99a':'#f4e3b3';ctx.fillStyle=c;ctx.fillRect(0,0,32,32);ctx.fillStyle=mix(c,'#ffffff',name==='navy'?.12:.3);for(let y=-13;y<=13;y++){const w=Math.round(Math.sqrt(169-y*y));ctx.fillRect(16-w,14+y,w*2,1);}
    ctx.fillStyle=sand;ctx.fillRect(0,27,32,5);ctx.fillStyle=mix(sand,'#ffffff',.5);ctx.fillRect(0,27,32,1);ctx.fillStyle=mix(sand,'#5a3d1e',.2);for(const[x,y]of[[3,29],[9,31],[20,30],[27,29],[14,29]])ctx.fillRect(x,y,1,1);return;}const d=SCENE_DEF[name],r=rnd(seed*97+5),hz=19,sd=25;
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){let c;if(y<hz){const t=y/hz;c=(t+((BAYER[y&3][x&3]+.5)/16-.5)*.5)>.5?d.sky[1]:d.sky[0];if(y<hz&&t>.78)c=mix(d.sky[1],'#ffffff',.12);}
    else if(y<sd){c=((x+y*2+Math.floor(frame/6))%7<2&&y>hz)?d.sea[1]:d.sea[0];if(y===hz)c=mix(d.sea[1],'#ffffff',.25);}
    else{c=d.sand;if(y===sd)c=mix(d.sand,'#ffffff',.45);else if((x*7+y*11)%13===0)c=mix(d.sand,'#5a3d1e',.22);else if(y>29)c=mix(d.sand,'#5a3d1e',.12);}
    ctx.fillStyle=c;ctx.fillRect(x,y,1,1);}
  const dot=(x,y,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,1,1);};
  const day=!d.stars&&!d.rain,pick=r(),left=r()<.5;
  if(day&&pick<.5){const cx=left?0:23,cy=1+Math.floor(r()*3),cc=mix(d.sky[1],'#ffffff',.7);ctx.fillStyle=cc;ctx.fillRect(cx,cy+1,9,2);ctx.fillRect(cx+2,cy,4,1);ctx.fillRect(cx+6,cy,2,1);ctx.fillStyle=mix(d.sky[1],'#ffffff',.35);ctx.fillRect(cx+1,cy+3,7,1);}
  else if(day&&pick<.75){const bx=left?2:24,by=2+Math.floor(r()*3),bc=mix(d.sky[0],'#0a1020',.6);for(const[ox,oy]of[[0,0],[4,2]]){ctx.fillStyle=bc;ctx.fillRect(bx+ox,by+oy+1,1,1);ctx.fillRect(bx+ox+1,by+oy,1,1);ctx.fillRect(bx+ox+2,by+oy+1,1,1);ctx.fillRect(bx+ox+3,by+oy,1,1);}}
  if(d.stars)for(let i=0;i<14;i++){const x=Math.floor(r()*32),y=Math.floor(r()*15);if((i+Math.floor(frame/10))%5)dot(x,y,'#ffffff');}
  if(d.moon){ctx.fillStyle=d.moon;ctx.fillRect(24,3,4,4);ctx.fillRect(25,2,2,6);ctx.fillRect(23,4,6,2);ctx.fillStyle=d.sky[0];ctx.fillRect(26,3,2,2);}
  if(d.sun){ctx.fillStyle=d.sun;for(let y=12;y<hz;y++){const w=[4,6,8,8,10,10,10][y-12];ctx.fillRect(16-w/2,y,w,1);}for(let y=hz+1;y<sd;y+=2){ctx.fillRect(13+((y+Math.floor(frame/8))%2),y,6,1);}}
  if(d.rain){for(let x=0;x<32;x++){const h=2+Math.round(Math.sin(x*.7)*1+Math.sin(x*.23+1)*1.2);ctx.fillStyle='#1a1f2b';ctx.fillRect(x,0,1,h+1);ctx.fillStyle='#3a4252';ctx.fillRect(x,h+1,1,1);}
    for(let i=0;i<20;i++){const x=Math.floor(r()*34),y=5+(Math.floor(r()*18)+frame)%18;for(let k=0;k<3;k++)dot(x-k,y+k,k?'#8fa6c0':'#c8d8ea');}
    if((seed%3)===0){ctx.fillStyle='#fff6b0';for(const[x,y]of[[27,4],[26,5],[27,6],[26,7],[25,8]])ctx.fillRect(x,y,2,1);}}
  if(d.rays)for(let i=0;i<5;i++){const x=3+i*6+((frame>>3)%2);ctx.fillStyle='rgba(255,226,120,.35)';ctx.fillRect(x,0,2,hz);}
  if(d.aurora)for(let x=0;x<32;x++){const y=4+Math.round(Math.sin(x*.4+frame*.06)*2+Math.sin(x*.17)*2);ctx.fillStyle='#5dffb5';ctx.fillRect(x,y,1,2);ctx.fillStyle='#38b6ff';ctx.fillRect(x,y+2,1,2+(x%3));}
  if(d.bubbles)for(let i=0;i<7;i++){const x=Math.floor(r()*32),y=(40-((Math.floor(r()*24)+Math.floor(frame/3))%24))%24;dot(x,y,'#bfeaff');}
  if(d.trees)for(let i=0;i<6;i++){const x=i*6+((i*5)%3),h=9+((i*7)%5);ctx.fillStyle='#0c2414';ctx.fillRect(x+1,hz-3,2,4);for(let k=0;k<h;k++){const w=2+Math.floor(k/2);ctx.fillRect(x+2-Math.ceil(w/2),hz-3-h+k,w,1);}}
}
// ---- hand-composed backdrops for the legendaries
const SCENE_CUSTOM=(()=>{
  const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  const grad=(c,y0,y1,a,b)=>{for(let y=y0;y<y1;y++)for(let x=0;x<32;x++){const t=(y-y0)/(y1-y0)+((BAYER[y&3][x&3]+.5)/16-.5)*.45;R(c,x,y,1,1,t>.66?b:t>.33?mix(a,b,.5):a);}};
  return{
  vault(c,seed,f){grad(c,0,24,'#0e0a14','#2a1d2e');for(let y=2;y<24;y+=6)for(let x=(y%12?1:4);x<32;x+=6)R(c,x,y,1,1,'#5a4a5e');
    for(let a=0;a<6.3;a+=.04){const x=16+Math.cos(a)*13,y=11+Math.sin(a)*12;R(c,Math.round(x),Math.round(y),1,1,'#8d93a6');R(c,Math.round(16+Math.cos(a)*11.4),Math.round(11+Math.sin(a)*10.4),1,1,'#4a4f63');}
    for(let k=0;k<8;k++){const a=k*Math.PI/4+f*.004;R(c,Math.round(16+Math.cos(a)*12.2)-1,Math.round(11+Math.sin(a)*11.2)-1,2,2,'#c9cede');}
    for(let y=24;y<32;y++)for(let x=0;x<32;x++)R(c,x,y,1,1,((Math.floor(x/4)+Math.floor((y-24)/2))%2)?'#2b2438':'#3a3149');R(c,0,24,32,1,'#6a6080');
    for(const[x,y]of[[0,19],[0,21],[1,17],[27,19],[27,21],[28,17]]){R(c,x,y,5,2,'#f4b730');R(c,x,y,5,1,'#ffe07a');R(c,x+4,y,1,2,'#b8801c');}
    for(const[x,y]of[[7,27],[22,29],[12,30],[25,26],[4,29]]){R(c,x,y,2,1,'#ffd34e');R(c,x,y+1,2,1,'#b8801c');}
    for(let i=0;i<4;i++){c.fillStyle='rgba(255,226,120,'+(.07+.05*Math.sin(f*.08+i))+')';c.beginPath();c.moveTo(4+i*8,0);c.lineTo(8+i*8,0);c.lineTo(3+i*8,24);c.lineTo(-3+i*8,24);c.fill();}},
  aurora(c,seed,f){grad(c,0,22,'#050b1e','#0f2a4a');const r=rnd(seed*7+3);for(let i=0;i<18;i++){const x=Math.floor(r()*32),y=Math.floor(r()*14);if((i+Math.floor(f/9))%6)R(c,x,y,1,1,i%4?'#ffffff':'#bfe6ff');}
    for(let x=0;x<32;x++){const y1=5+Math.sin(x*.38+f*.05)*2.2+Math.sin(x*.15+1)*2,y2=9+Math.sin(x*.3+f*.035+2)*2;R(c,x,Math.round(y1),1,2,'#5dffb5');R(c,x,Math.round(y1)+2,1,2+(x%3),'#2fbf9a');R(c,x,Math.round(y1)+4+(x%3),1,1,'#1d7f8a');R(c,x,Math.round(y2),1,1,'#b07cff');R(c,x,Math.round(y2)+1,1,1+(x%2),'#6a4fc9');}
    for(let x=0;x<32;x++){const h=Math.round(3+Math.abs(Math.sin(x*.45+1))*5+Math.sin(x*.9)*1.4);R(c,x,23-h,1,h,'#16284a');if(h>5)R(c,x,23-h,1,2,'#dfeaf5');}
    grad(c,23,32,'#e8f2fb','#a9c4e0');R(c,0,23,32,1,'#ffffff');for(const[x,h]of[[2,5],[5,3],[27,6],[30,4]]){for(let k=0;k<h;k++){R(c,x,24-k,1,1,'#8fe9ff');R(c,x+1,24-k,1,1,'#3aa6d8');}R(c,x,24-h,1,1,'#ffffff');}},
  deep(c,seed,f){grad(c,0,25,'#1a7aa8','#07365c');for(let i=0;i<4;i++){c.fillStyle='rgba(190,240,255,.13)';const s=Math.sin(f*.03+i)*2;c.beginPath();c.moveTo(3+i*9+s,0);c.lineTo(8+i*9+s,0);c.lineTo(-2+i*9,25);c.lineTo(-8+i*9,25);c.fill();}
    const fx=(f*.12)%44-6;R(c,Math.round(fx),6,4,2,'#0a4468');R(c,Math.round(fx)-2,6,2,1,'#0a4468');R(c,Math.round(fx)-2,7,2,1,'#0a4468');const fx2=38-(f*.08)%46;R(c,Math.round(fx2),13,3,1,'#0c4f78');R(c,Math.round(fx2)+3,12,1,3,'#0c4f78');
    grad(c,25,32,'#d6dcb4','#8fa98e');R(c,0,25,32,1,'#eef2cf');for(const[x,h,p]of[[1,9,0],[4,6,1],[28,10,2],[30,7,3]])for(let k=0;k<h;k++){const sx=x+Math.round(Math.sin(k*.6+f*.06+p)*1.2);R(c,sx,26-k,1,1,k%2?'#2f8f6a':'#1f6b52');}
    for(const[x,y]of[[8,28],[20,30],[25,27]]){R(c,x,y,2,1,'#ffb3c7');R(c,x,y+1,2,1,'#c9708e');}
    const r=rnd(seed*5+1);for(let i=0;i<9;i++){const x=Math.floor(r()*32),y=(60-((Math.floor(r()*26)+Math.floor(f/3))%26))%26;R(c,x,y,1,1,'#d9f6ff');if(i%3===0)R(c,x+1,y,1,1,'#8fd8f0');}},
  wreck(c,seed,f){grad(c,0,25,'#0a3a5c','#021523');for(let i=0;i<3;i++){c.fillStyle='rgba(150,220,255,.08)';c.beginPath();c.moveTo(6+i*10,0);c.lineTo(10+i*10,0);c.lineTo(2+i*10,25);c.lineTo(-3+i*10,25);c.fill();}
    const H='#03101c';c.fillStyle=H;c.beginPath();c.moveTo(15,25);c.lineTo(19,14);c.lineTo(32,11);c.lineTo(32,25);c.fill();R(c,24,2,1,12,H);R(c,21,5,7,1,H);R(c,28,4,1,9,H);for(const x of[18,20,22])R(c,x,16+(x%3),1,8,H);
    for(const[x,y,k]of[[23,17,0],[27,16,5],[30,18,9]])R(c,x,y,2,2,((Math.floor(f/14)+k)%7)?'#ffd76a':'#7a5a1a');
    R(c,3,15,1,9,'#22303c');R(c,1,22,5,1,'#22303c');R(c,1,20,1,2,'#22303c');R(c,5,20,1,2,'#22303c');R(c,2,14,3,1,'#22303c');
    const jy=5+Math.round(Math.sin(f*.07)*2);R(c,6,jy,5,2,'#ff9fd0');R(c,7,jy-1,3,1,'#ffc4e2');for(const x of[6,8,10])R(c,x,jy+2,1,2+((x+Math.floor(f/6))%2),'#c96aa0');
    grad(c,25,32,'#5f7a82','#2f4650');R(c,0,25,32,1,'#8aa6ac');const r=rnd(seed*5+1);for(let i=0;i<8;i++){const x=Math.floor(r()*32),y=(60-((Math.floor(r()*26)+Math.floor(f/3))%26))%26;R(c,x,y,1,1,'#bfeaff');}},
  ship(c,seed,f){grad(c,0,19,'#ff9a6a','#ffd9a0');R(c,4,9,6,6,'#fff3c4');R(c,5,8,4,8,'#fff3c4');for(let x=0;x<32;x++)R(c,x,19,1,5,((x+Math.floor(f/6))%5<2)?'#3f8fc0':'#2f6f9e');
    R(c,25,0,2,24,'#3a2416');c.fillStyle='#f1e6cf';c.beginPath();c.moveTo(24,2);c.lineTo(24,17);c.lineTo(9,15);c.lineTo(11,4);c.fill();R(c,24,2,1,15,'#c9bfa6');R(c,27,1,4,3,'#15101f');R(c,28,2,1,1,'#f4f1e8');
    for(let y=24;y<32;y++)for(let x=0;x<32;x++)R(c,x,y,1,1,((y-24)%3===0)?'#5a3a22':(x+((y-24)>>1)*5)%11===0?'#6a4628':'#8a5a33');R(c,0,24,32,1,'#b07a44');R(c,0,22,32,1,'#3a2416');for(let x=2;x<32;x+=5)R(c,x,20,1,3,'#3a2416');},
  space(c,seed,f){R(c,0,0,32,32,'#05060f');const r=rnd(seed*9+2);for(let i=0;i<34;i++){const x=Math.floor(r()*32),y=Math.floor(r()*25);if((i+Math.floor(f/8))%7)R(c,x,y,1,1,i%5?'#ffffff':'#9fd0ff');}
    for(let y=-9;y<=9;y++){const w=Math.round(Math.sqrt(81-y*y));for(let x=-w;x<=w;x++){const X=6+x,Y=8+y;if(X<0||Y<0)continue;R(c,X,Y,1,1,((x*3+y*5+40)%9<3||(x+y)%7===0)?'#3fbf6a':'#2f7fd0');}}R(c,2,4,5,1,'#e9f4ff');R(c,7,11,4,1,'#e9f4ff');
    grad(c,25,32,'#b9bcc8','#7a7d8c');R(c,0,25,32,1,'#e2e4ee');for(const[x,y,w]of[[3,28,4],[20,29,5],[12,30,3],[27,27,3]]){R(c,x,y,w,1,'#6a6d7c');R(c,x,y+1,w,1,'#9a9dac');}},
  bullrun(c,seed,f){grad(c,0,25,'#050d09','#0c2216');for(let y=4;y<25;y+=5)for(let x=0;x<32;x+=2)R(c,x,y,1,1,'#123322');
    const H=[3,4,3,5,4,6,5,8,7,10];H.forEach((h,i)=>{if(i>2&&i<7)return;const x=1+i*3,up=i%3!==2,base=24-Math.round(i*.9),col=up?'#1f8a52':'#a8323a';R(c,x+1,base-h-2,1,h+3,col);R(c,x,base-h,3,h,col);R(c,x,base-h,1,h,up?'#3fd08a':'#e2656a');});
    const k=Math.floor(f/6)%10;R(c,1+k*3,2,2,1,'#7dffb2');
    grad(c,25,32,'#123322','#0a1f14');R(c,0,25,32,1,'#2fbf71');},
  haunted(c,seed,f){grad(c,0,25,'#140a24','#3d2052');for(let y=-5;y<=5;y++){const w=Math.round(Math.sqrt(30-y*y));R(c,7-w,7+y,w*2,1,'#f1ecd4');}R(c,5,5,2,2,'#d9d2b4');R(c,9,9,2,1,'#d9d2b4');
    const T='#0a0614';R(c,26,6,2,19,T);R(c,22,9,5,1,T);R(c,21,7,1,3,T);R(c,27,12,4,1,T);R(c,30,10,1,3,T);R(c,24,4,1,3,T);R(c,28,3,1,4,T);
    for(const[x,h]of[[1,5],[19,4]]){R(c,x,25-h,4,h,'#5a5670');R(c,x+1,24-h,2,1,'#5a5670');R(c,x+1,26-h,2,1,'#2a2438');R(c,x+2,26-h,1,2,'#2a2438');}
    grad(c,25,32,'#2f2440','#1a1228');R(c,0,25,32,1,'#4a3a66');for(let i=0;i<3;i++){c.fillStyle='rgba(200,190,230,.16)';c.fillRect(((f*.15+i*13)%44)-12,17+i*3,14,2);}
    for(let i=0;i<4;i++){const x=Math.round(6+i*7+Math.sin(f*.06+i*2)*2),y=Math.round(14+Math.cos(f*.05+i)*3);R(c,x,y,1,1,'#c9ff9a');if((f+i*5)%12<6)R(c,x,y-1,1,1,'#efffd6');}},
  throne(c,seed,f){grad(c,0,25,'#2a0a14','#5a1626');for(let y=2;y<24;y+=5)for(let x=(y%10?2:5);x<32;x+=6)R(c,x,y,1,1,'#c99a2e');
    for(const x of[0,27]){R(c,x,0,5,25,'#cfc6b4');R(c,x,0,1,25,'#efe8d8');R(c,x+4,0,1,25,'#9a917e');R(c,x-0,22,5,3,'#b8ae98');}
    R(c,7,2,18,23,'#8a6418');R(c,8,3,16,22,'#4a0e18');for(let y=5;y<24;y+=4)for(let x=10;x<23;x+=4)R(c,x,y,1,1,'#7a1a26');R(c,7,0,2,3,'#c99a2e');R(c,23,0,2,3,'#c99a2e');
    grad(c,25,32,'#c9283a','#8a1422');R(c,0,25,32,1,'#f4b730');R(c,0,26,3,6,'#6a5a3a');R(c,29,26,3,6,'#6a5a3a');const k=Math.floor(f/5)%16;R(c,8+k,3,1,1,'#fffbe0');},
  sherwood(c,seed,f){grad(c,0,24,'#3a2208','#e0a03a');c.fillStyle='rgba(255,236,160,.5)';c.beginPath();c.ellipse(16,12,11,10,0,0,6.3);c.fill();c.fillStyle='rgba(255,246,200,.45)';c.beginPath();c.ellipse(16,11,6.5,6,0,0,6.3);c.fill();
    for(const[x,w]of[[0,3],[6,2],[11,1],[23,2],[28,4]]){R(c,x,0,w,24,'#2a1608');R(c,x,0,1,24,'#4a2a10');}
    for(const[x,y,rx]of[[2,1,6],[13,-1,6],[27,2,7],[8,4,3],[22,4,3]])for(let yy=-3;yy<=3;yy++){const w=Math.round(rx*Math.sqrt(1-(yy/3.4)**2));R(c,x-w,y+yy,w*2,1,yy<0?'#5a6a1c':'#3a4a14');}
    for(let i=0;i<3;i++){c.fillStyle='rgba(255,240,170,.16)';c.beginPath();c.moveTo(10+i*8,0);c.lineTo(13+i*8,0);c.lineTo(6+i*8,24);c.lineTo(1+i*8,24);c.fill();}
    for(const[x,y,w,k]of[[1,10,3,'#f4f1e8'],[0,11,5,'#f4f1e8'],[0,12,5,'#f4f1e8'],[0,13,5,'#f4f1e8'],[1,14,3,'#f4f1e8'],[1,11,3,'#e2413b'],[1,13,3,'#e2413b'],[1,12,1,'#e2413b'],[3,12,1,'#e2413b'],[2,12,1,'#ffd34e']])R(c,x,y,w,1,k);R(c,5,12,4,1,'#8a5a2b');R(c,9,11,1,3,'#e2413b');
    grad(c,24,32,'#6f8f2c','#3e5a1c');R(c,0,24,32,1,'#a8c44a');for(let x=1;x<32;x+=3)R(c,x,23-(x%2),1,2,'#56741f');for(const[x,y,k]of[[5,28,'#ffe27a'],[24,29,'#ff7fb0'],[14,30,'#f4f1e8']]){R(c,x,y,1,1,k);R(c,x,y+1,1,1,'#3e5a1c');}
    const r=rnd(seed*3+8);for(let i=0;i<7;i++){const x=Math.floor(r()*32),y=4+Math.floor(r()*18);if(((i*5+Math.floor(f/7))%9)<4){R(c,x,y,1,1,'#fffbd0');}}},
};})();
// the shell level, drawn on the image itself: five pips top-left, a gold frame at the top level, and sleep marks at level 0
function drawLevel(ctx,level,frame=0){ctx.fillStyle='rgba(21,16,31,.62)';ctx.fillRect(1,1,16,4);ctx.fillRect(2,0,14,1);ctx.fillRect(2,5,14,1);
  for(let i=0;i<5;i++){const x=2+i*3;if(i<level){ctx.fillStyle='#ffd34e';ctx.fillRect(x,2,2,2);ctx.fillStyle='#fff3b0';ctx.fillRect(x,2,1,1);}else{ctx.fillStyle='#4d4766';ctx.fillRect(x,2,2,2);}}
  if(level>=5){ctx.fillStyle='#f4b730';ctx.fillRect(0,0,32,1);ctx.fillRect(0,31,32,1);ctx.fillRect(0,0,1,32);ctx.fillRect(31,0,1,32);ctx.fillStyle='#fff3b0';const k=Math.floor(frame/4)%62;const px=k<31?[k,0]:[31-(k-31),31];ctx.fillRect(px[0],px[1],2,1);ctx.fillRect(0,0,1,1);ctx.fillRect(31,31,1,1);
    ctx.fillStyle='rgba(21,16,31,.62)';ctx.fillRect(2,1,14,1);}
  if(level===0){ctx.fillStyle='#f4fbff';const b=Math.floor(frame/8)%3;for(let z=0;z<=b;z++){const x=22+z*3,y=9-z*3;ctx.fillRect(x,y,3,1);ctx.fillRect(x+1,y+1,1,1);ctx.fillRect(x,y+2,3,1);}}}
function sparkle(ctx,seed,frame,col='#ffffff'){const r=rnd(seed*31+9);for(let i=0;i<5;i++){const x=3+Math.floor(r()*26),y=1+Math.floor(r()*13),ph=(frame+i*9)%40;if(ph<10){ctx.fillStyle=col;ctx.fillRect(x,y,1,1);if(ph>2&&ph<8){ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3);}}}}
if(typeof module!=='undefined')module.exports={FLAT,drawLevel,SHELL_META,normalise,SHELL_COLORS,BODY_COLORS,EYES,MOUTHS,CLAWS,HELD,MARKS,EXTRAS,SCENES,SCENE_DEF,wpick,rnd,drawCrab,rollTraits,legendTraits,resolve,drawScene,sparkle,SHELLS,SHELL_LIST,LEGENDARY,SHELL_NAMES};
