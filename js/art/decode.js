// collection.json row -> trait object
function decodePiece(p){if(p.L)return{...legendTraits(p.L),legend:p.L};
  return{shell:SHELL_LIST[p[0]][0],pat:p[1],shellColor:p[2]<0?null:SHELL_COLORS[p[2]],altColor:p[3]<0?null:SHELL_COLORS[p[3]],body:BODY_COLORS[p[4]],eyes:EYES[p[5]][0],claws:CLAWS[p[6]][0],held:HELD[p[7]][0],mark:MARKS[p[8]][0],extra:EXTRAS[p[9]][0],scene:SCENES[p[10]][0],mouth:MOUTHS[p[11]][0]};}
