let phaseIndex = 0;
let currentHRM = "--";
let actionInterval, secondInterval, mainTimeout;

const phases = [
  { label: "Einatmen",  duration: 4, color:"#0000FF", action:"pulse" },
  { label: "Halten",    duration: 7, color:"#00FF00", action:"none" },
  { label: "Ausatmen",  duration: 8, color:"#800080", action:"custom" },
  { label: "Pause",     duration: 5, color:"#000000", action:"none" }
];

Bangle.setHRMPower(1);
Bangle.on('HRM', hrm => currentHRM = Math.round(hrm.bpm));

function show(label, color, time, max) {
  g.clear(); g.setColor(color);
  g.fillRect(0,0,g.getWidth(),g.getHeight());
  g.setColor("#FFF");
  g.setFont("Vector",30); g.drawString(label,10,30);
  g.setFont("Vector",50); g.drawString(time+" / "+max,20,80);
  g.setFont("6x8",2); g.drawString("♥ "+currentHRM, 5, 5);
}

function startAction(act) {
  if (act==="pulse")
    actionInterval = setInterval(()=>Bangle.buzz(150),1000);
  else if(act==="custom"){
    [0,2,7].forEach(t=>setTimeout(()=>Bangle.buzz(150),t*1000));
  }
}

function startPhase(){
  let p = phases[phaseIndex];
  let t=1;
  show(p.label,p.color,t,p.duration);
  startAction(p.action);
  secondInterval = setInterval(()=>{
    t++;
    if(t<=p.duration) show(p.label,p.color,t,p.duration);
  },1000);
  mainTimeout = setTimeout(()=>{
    clearInterval(secondInterval);
    clearTimeout(actionInterval);
    clearInterval(actionInterval);
    digitalWrite(D13,0);
    phaseIndex = (phaseIndex+1)%phases.length;
    startPhase();
  },p.duration*1000);
}

function stop(){
  clearInterval(secondInterval);
  clearTimeout(mainTimeout);
  clearInterval(actionInterval);
  clearTimeout(actionInterval);
  digitalWrite(D13,0);
  Bangle.setHRMPower(0);
  g.clear(); g.setColor("#000");
  g.setFont("Vector",24);
  g.drawString("Beendet",30,70);
}

setWatch(stop,BTN1,{repeat:true,edge:"falling",debounce:50});
Bangle.loadWidgets(); Bangle.drawWidgets();
Bangle.setLCDTimeout(0); Bangle.setLCDPower(1);
startPhase();
