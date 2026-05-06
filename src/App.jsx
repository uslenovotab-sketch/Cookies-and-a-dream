import { useState, useEffect, useCallback, useRef } from "react";

const THEMES = {
  blossom: { name:"🌸 Blossom", primary:"#73A9C2", primaryDark:"#5a8fa8", bg:"#FBCFCD", dot:"#FFF0F5", nav:"rgba(255,240,245,0.97)", card:"rgba(255,255,255,0.75)", strip:"rgba(251,207,205,0.8)", sub:"#b0848a", border:"#f0d8d8", accent:"#f48fb1" },
  forest:  { name:"🌿 Forest",  primary:"#5a8a6a", primaryDark:"#3d6b4f", bg:"#eef4ee", dot:"#c8e6c9", nav:"rgba(238,244,238,0.97)", card:"rgba(255,255,255,0.8)",  strip:"rgba(200,230,201,0.5)", sub:"#7a9a7a", border:"#c8e6c9", accent:"#81c784" },
  midnight:{ name:"🌙 Midnight",primary:"#7c83d6", primaryDark:"#5c63c6", bg:"#1a1a2e", dot:"#2a2a4e", nav:"rgba(26,26,46,0.97)",   card:"rgba(40,40,70,0.9)",   strip:"rgba(40,40,70,0.8)",   sub:"#9090b0", border:"#3a3a6e", accent:"#9fa8da" },
  peach:   { name:"🍑 Peach",   primary:"#e07b54", primaryDark:"#c4623b", bg:"#fff8f0", dot:"#ffe0cc", nav:"rgba(255,248,240,0.97)", card:"rgba(255,255,255,0.85)", strip:"rgba(255,224,204,0.5)", sub:"#c09070", border:"#ffd0b0", accent:"#ffab76" },
};

const GREEN="#4caf50", ORANGE="#ff9800", RED="#ef5350";
const HOURS=[];
for(let h=5;h<=23;h++){HOURS.push(`${h}:00`);if(h<23)HOURS.push(`${h}:30`);}
const BLOCK_HOURS=["5:00","6:00","7:00","8:00","9:00","10:00","11:00","12:00","1:00","2:00","3:00","4:00","5:00","6:00","7:00","8:00","9:00","10:00","11:00"];
const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_SHORT=["S","M","T","W","T","F","S"];
const MOODS=["😊","😐","😔","😤","😰","🤩","😴"];
const ENERGY=["⚡⚡⚡","⚡⚡","⚡","💤"];

const STORE_KEY="plasticity_v4";
function loadStore(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||{};}catch{return{};}}
function saveStore(s){try{localStorage.setItem(STORE_KEY,JSON.stringify(s));}catch{}}

const dateKey=(y,m,d)=>`day:${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const monthKey=(y,m)=>`month:${y}-${String(m+1).padStart(2,"0")}`;
const habitsKey=(y,m)=>`habits:${y}-${String(m+1).padStart(2,"0")}`;
const habitNamesKey=()=>"habitNames";
const appThemeKey=()=>"appTheme";

const emptyTask=()=>({name:"",micros:["","",""],expected:"",actual:"",done:false,timerSecs:0,priority:""});
const emptyDay=()=>({
  brainDump:"",tasks:[emptyTask(),emptyTask(),emptyTask(),emptyTask(),emptyTask()],
  timeBlocks:BLOCK_HOURS.map(()=>""),timeDetails:HOURS.map(()=>({text:"",done:false})),
  reflectDetails:HOURS.map(()=>({text:"",done:false})),
  reflectionNotes:"",endOfDay:"",mood:"",energy:"",water:0,wins:"",gratitude:"",intention:""
});
const emptyMonth=()=>({goals:""});
const defaultHabits=()=>["Morning workout","Read 30 min","Meditate","No social media before 10am","Drink 2L water","Journal","Sleep by 11pm"];

function DotGrid({T}){
  return <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:`radial-gradient(circle, ${T.dot} 0.8px, transparent 0.8px)`,backgroundSize:"24px 24px"}}/>;
}

function makeStyles(T){return{
  label:{fontFamily:"system-ui,sans-serif",fontSize:11,fontWeight:700,color:T.primaryDark,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2},
  sub:{fontFamily:"system-ui,sans-serif",fontSize:11,color:T.sub,marginBottom:10},
  textarea:{width:"100%",resize:"none",border:`1.5px solid ${T.primary}44`,borderRadius:10,padding:"10px 12px",fontFamily:"system-ui,sans-serif",fontSize:13,color:T.primaryDark,background:T.card,outline:"none",lineHeight:1.7,boxSizing:"border-box"},
  input:{border:"none",borderBottom:`1px solid ${T.primary}55`,background:"transparent",fontFamily:"system-ui,sans-serif",fontSize:13,color:T.primaryDark,outline:"none",padding:"4px 0",width:"100%"},
  ghostBtn:{background:"none",border:`1.5px dashed ${T.primary}`,borderRadius:8,color:T.primaryDark,fontFamily:"system-ui,sans-serif",fontSize:12,padding:"6px 14px",cursor:"pointer",fontWeight:600},
  card:{background:T.card,borderRadius:14,marginBottom:10,border:`1.5px solid ${T.primary}33`,overflow:"hidden",boxShadow:`0 1px 8px ${T.primary}10`},
};}

function TaskTimer({secs,onChange,T}){
  const [run,setRun]=useState(false);
  const ref=useRef(null);
  const sr=useRef(secs);
  sr.current=secs;
  useEffect(()=>{
    if(run){ref.current=setInterval(()=>{onChange(sr.current+1);},1000);}
    else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[run]);
  const mm=String(Math.floor(secs/60)).padStart(2,"0"),ss=String(secs%60).padStart(2,"0");
  return(
    <div style={{display:"flex",alignItems:"center",gap:4,background:run?"rgba(76,175,80,0.12)":`${T.primary}15`,borderRadius:20,padding:"3px 8px"}}>
      <span style={{fontFamily:"monospace",fontSize:12,color:run?GREEN:T.primaryDark,fontWeight:700,minWidth:38}}>{mm}:{ss}</span>
      <button onClick={()=>setRun(r=>!r)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"0 2px",lineHeight:1}}>{run?"⏸":"▶️"}</button>
      {secs>0&&<button onClick={()=>{setRun(false);onChange(0);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,padding:0,color:T.sub,lineHeight:1}}>↺</button>}
    </div>
  );
}

function FocusMode({onClose,T}){
  const [mins,setMins]=useState(25);
  const [secs,setSecs]=useState(0);
  const [run,setRun]=useState(false);
  const [phase,setPhase]=useState("work");
  const [cycles,setCycles]=useState(0);
  const ref=useRef(null);
  useEffect(()=>{
    if(run){
      ref.current=setInterval(()=>{
        setSecs(s=>{
          if(s>0)return s-1;
          setMins(m=>{
            if(m>0)return m-1;
            clearInterval(ref.current);setRun(false);
            if(phase==="work"){setCycles(c=>c+1);setPhase("break");setMins(5);setSecs(0);}
            else{setPhase("work");setMins(25);setSecs(0);}
            return 0;
          });
          return 59;
        });
      },1000);
    } else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[run,phase]);
  const total=phase==="work"?25*60:5*60;
  const elapsed=(phase==="work"?25:5)*60-mins*60-secs;
  const pct=Math.min(1,elapsed/total);
  const r2=54,circ=2*Math.PI*r2;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:T.bg,borderRadius:24,padding:"28px 22px",width:290,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:11,fontWeight:700,color:T.primaryDark,letterSpacing:"0.08em",textTransform:"uppercase",margin:0}}>{phase==="work"?"🎯 Focus Time":"☕ Break"}</p>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:T.sub,cursor:"pointer"}}>✕</button>
        </div>
        <svg width={120} height={120} style={{marginBottom:14}}>
          <circle cx={60} cy={60} r={r2} fill="none" stroke={`${T.primary}30`} strokeWidth={8}/>
          <circle cx={60} cy={60} r={r2} fill="none" stroke={phase==="work"?T.primary:GREEN} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 0.5s"}}/>
          <text x={60} y={57} textAnchor="middle" fontFamily="monospace" fontSize={20} fontWeight={700} fill={T.primaryDark}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</text>
          <text x={60} y={74} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize={10} fill={T.sub}>{phase}</text>
        </svg>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:12}}>
          <button onClick={()=>setRun(r=>!r)} style={{background:run?ORANGE:T.primary,border:"none",borderRadius:10,color:"#fff",fontFamily:"system-ui,sans-serif",fontSize:13,fontWeight:700,padding:"9px 24px",cursor:"pointer"}}>{run?"Pause":"Start"}</button>
          <button onClick={()=>{setRun(false);setMins(phase==="work"?25:5);setSecs(0);}} style={{background:"none",border:`1.5px dashed ${T.primary}`,borderRadius:10,color:T.primaryDark,fontFamily:"system-ui,sans-serif",fontSize:12,padding:"9px 14px",cursor:"pointer",fontWeight:600}}>Reset</button>
        </div>
        <p style={{fontFamily:"system-ui,sans-serif",fontSize:12,color:T.sub,marginBottom:12}}>🔄 Cycles: {cycles}</p>
        <div style={{display:"flex",gap:5,justifyContent:"center"}}>
          {[15,20,25,30,45].map(m=>(
            <button key={m} onClick={()=>{setRun(false);setMins(m);setSecs(0);setPhase("work");}} style={{background:mins===m&&!run?T.primary:`${T.primary}18`,color:mins===m&&!run?"#fff":T.primaryDark,border:"none",borderRadius:20,padding:"4px 9px",fontFamily:"monospace",fontSize:11,cursor:"pointer"}}>{m}m</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksPage({dayData,updateDay,T}){
  const S=makeStyles(T);
  const [expanded,setExpanded]=useState(null);
  const [showFocus,setShowFocus]=useState(false);
  const tasks=dayData.tasks||[emptyTask(),emptyTask(),emptyTask(),emptyTask(),emptyTask()];
  const updateTask=(i,f,v)=>{const t=[...tasks];t[i]={...t[i],[f]:v};updateDay("tasks",t);};
  const updateMicro=(ti,mi,v)=>{const t=[...tasks],m=[...(t[ti].micros||["","",""])];m[mi]=v;t[ti]={...t[ti],micros:m};updateDay("tasks",t);};
  const addMicro=(i)=>{const t=[...tasks];t[i]={...t[i],micros:[...(t[i].micros||[]),""]};updateDay("tasks",t);};
  const doneTasks=tasks.filter(t=>t.name&&t.done).length;
  const totalTasks=tasks.filter(t=>t.name).length;
  return(
    <div style={{padding:"16px",position:"relative"}}>
      <DotGrid T={T}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div><p style={S.label}>Key Tasks</p><p style={S.sub}>tap to expand · checkbox to complete</p></div>
          <button onClick={()=>setShowFocus(true)} style={{background:T.primary,border:"none",borderRadius:20,color:"#fff",fontFamily:"system-ui,sans-serif",fontSize:11,fontWeight:700,padding:"6px 14px",cursor:"pointer"}}>🎯 Focus</button>
        </div>
        {totalTasks>0&&(
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontFamily:"system-ui,sans-serif",fontSize:11,color:T.primaryDark,fontWeight:600}}>{doneTasks}/{totalTasks} done</span>
              <span style={{fontFamily:"monospace",fontSize:11,color:T.primaryDark}}>{Math.round((doneTasks/totalTasks)*100)}%</span>
            </div>
            <div style={{height:6,background:`${T.primary}25`,borderRadius:3}}>
              <div style={{height:"100%",width:`${(doneTasks/totalTasks)*100}%`,background:doneTasks===totalTasks?GREEN:T.primary,borderRadius:3,transition:"width 0.4s"}}/>
            </div>
          </div>
        )}
        <div style={S.card}>
          <div style={{padding:"12px 14px"}}>
            <p style={{...S.label,marginBottom:6}}>🧠 Brain Dump</p>
            <textarea value={dayData.brainDump||""} onChange={e=>updateDay("brainDump",e.target.value)} placeholder="Everything on your mind first..." style={{...S.textarea,height:72,border:"none",padding:"0"}}/>
          </div>
        </div>
        {tasks.map((task,i)=>(
          <div key={i} style={{...S.card,border:`1.5px solid ${task.done?GREEN+"66":expanded===i?T.primary:`${T.primary}22`}`,opacity:task.done?0.8:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 12px"}}>
              <div onClick={()=>{const t=[...tasks];t[i]={...t[i],done:!t[i].done};updateDay("tasks",t);}} style={{width:26,height:26,borderRadius:8,border:`2px solid ${task.done?GREEN:T.primary}`,background:task.done?GREEN:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                {task.done&&<span style={{color:"#fff",fontSize:14,lineHeight:1}}>✓</span>}
              </div>
              <div style={{width:22,height:22,borderRadius:"50%",background:task.name?(task.done?GREEN:T.primary):"#ccc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
              <span onClick={()=>setExpanded(expanded===i?null:i)} style={{flex:1,fontFamily:"system-ui,sans-serif",fontSize:13,color:task.name?T.primaryDark:"#bbb",textDecoration:task.done?"line-through":"none",cursor:"pointer"}}>{task.name||`Task ${i+1}...`}</span>
              {task.name&&<TaskTimer secs={task.timerSecs||0} onChange={v=>updateTask(i,"timerSecs",v)} T={T}/>}
              <span onClick={()=>setExpanded(expanded===i?null:i)} style={{fontSize:12,color:T.sub,cursor:"pointer"}}>{expanded===i?"▲":"▼"}</span>
            </div>
            {expanded===i&&(
              <div style={{padding:"0 12px 12px",borderTop:`1px solid ${T.primary}22`}}>
                <textarea value={task.name||""} onChange={e=>updateTask(i,"name",e.target.value)} placeholder="What's this task?" autoFocus style={{...S.textarea,height:56,marginTop:10,fontSize:13}}/>
                <p style={{...S.sub,marginTop:10,marginBottom:6}}>📋 Steps</p>
                {(task.micros||["","",""]).map((m,mi)=>(
                  <div key={mi} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:T.primary,flexShrink:0}}/>
                    <input value={m} onChange={e=>updateMicro(i,mi,e.target.value)} placeholder={`Step ${mi+1}`} style={S.input}/>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                  <button onClick={()=>addMicro(i)} style={S.ghostBtn}>+ Step</button>
                  <button onClick={()=>updateDay("tasks",tasks.filter((_,idx)=>idx!==i))} style={{...S.ghostBtn,color:RED,border:`1.5px dashed ${RED}44`}}>🗑 Remove</button>
                </div>
                <div style={{display:"flex",gap:10,marginTop:12}}>
                  <div style={{flex:1}}><p style={S.sub}>⏱ Expected</p><input value={task.expected||""} onChange={e=>updateTask(i,"expected",e.target.value)} placeholder="30m" style={{...S.input,textAlign:"center"}}/></div>
                  <div style={{flex:1}}><p style={S.sub}>✅ Actual</p><input value={task.actual||""} onChange={e=>updateTask(i,"actual",e.target.value)} placeholder="45m" style={{...S.input,textAlign:"center"}}/></div>
                </div>
                <div style={{marginTop:12}}>
                  <p style={{...S.sub,marginBottom:6}}>Priority</p>
                  <div style={{display:"flex",gap:6}}>
                    {["🔴 Urgent","🟡 Medium","🟢 Low"].map(p=>(
                      <button key={p} onClick={()=>updateTask(i,"priority",task.priority===p?"":p)} style={{flex:1,padding:"5px 4px",borderRadius:8,border:`1.5px solid ${task.priority===p?T.primary:"#ddd"}`,background:task.priority===p?`${T.primary}18`:"transparent",fontFamily:"system-ui,sans-serif",fontSize:11,color:T.primaryDark,cursor:"pointer"}}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <button onClick={()=>updateDay("tasks",[...tasks,emptyTask()])} style={{...S.ghostBtn,width:"100%",padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13}}>
          <span style={{fontSize:18,lineHeight:1}}>+</span> Add Task
        </button>
        <div style={{marginTop:16,padding:"12px 14px",background:`${T.primary}12`,borderRadius:12,border:`1px dashed ${T.primary}`}}>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:12,color:T.primaryDark,lineHeight:1.6}}>💡 <strong>ADHD tip:</strong> Pick just <strong>1-3 must-dos</strong> today. Everything else is a bonus!</p>
        </div>
      </div>
      {showFocus&&<FocusMode onClose={()=>setShowFocus(false)} T={T}/>}
    </div>
  );
}

function TimePage({dayData,updateDay,T}){
  const S=makeStyles(T);
  const [tab,setTab]=useState("blocking");
  const blocks=dayData.timeBlocks||BLOCK_HOURS.map(()=>"");
  const details=dayData.timeDetails||HOURS.map(()=>({text:"",done:false}));
  const reflectDetails=dayData.reflectDetails||HOURS.map(()=>({text:"",done:false}));
  const updateBlock=(i,v)=>{const b=[...blocks];b[i]=v;updateDay("timeBlocks",b);};
  const updateDetail=(i,f,v)=>{const d=[...details];d[i]={...d[i],[f]:v};updateDay("timeDetails",d);};
  const updateReflect=(i,f,v)=>{const d=[...reflectDetails];d[i]={...d[i],[f]:v};updateDay("reflectDetails",d);};
  return(
    <div style={{padding:"16px",position:"relative"}}>
      <DotGrid T={T}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[["blocking","🗓 Block"],["detail","⏱ Schedule"],["reflect","📝 Reflect"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:"none",background:tab===k?T.primary:T.card,color:tab===k?"#fff":T.primaryDark,fontFamily:"system-ui,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        {tab==="blocking"&&(
          <div>
            <p style={S.label}>Time Blocking</p><p style={S.sub}>[plan the night before]</p>
            {BLOCK_HOURS.map((h,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontFamily:"monospace",fontSize:12,color:T.primaryDark,minWidth:44,fontWeight:700}}>{h}</span>
                <div style={{flex:1,background:T.card,borderRadius:10,border:`1px solid ${T.primary}33`}}>
                  <input value={blocks[i]||""} onChange={e=>updateBlock(i,e.target.value)} placeholder="What are you doing..." style={{...S.input,padding:"10px 12px",border:"none"}}/>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="detail"&&(
          <div>
            <p style={S.label}>Detailed Schedule</p><p style={S.sub}>[fill in on the day]</p>
            {HOURS.map((h,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,borderBottom:h.endsWith(":00")?`1px solid ${T.primary}44`:`1px dashed ${T.primary}22`,padding:"5px 0"}}>
                <span style={{fontFamily:"monospace",fontSize:11,minWidth:44,color:h.endsWith(":00")?T.primaryDark:T.sub,fontWeight:h.endsWith(":00")?700:400}}>{h}</span>
                <input value={details[i]?.text||""} onChange={e=>updateDetail(i,"text",e.target.value)} style={{flex:1,border:"none",background:"transparent",fontFamily:"system-ui,sans-serif",fontSize:13,color:T.primaryDark,outline:"none",padding:"4px 0"}}/>
                <div onClick={()=>updateDetail(i,"done",!details[i]?.done)} style={{width:22,height:22,border:`2px solid ${details[i]?.done?GREEN:`${T.primary}66`}`,borderRadius:6,background:details[i]?.done?GREEN:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                  {details[i]?.done&&<span style={{color:"#fff",fontSize:13,lineHeight:1}}>✓</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="reflect"&&(
          <div>
            <p style={S.label}>Reflection Log</p><p style={S.sub}>[how did the day actually go?]</p>
            {HOURS.map((h,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,borderBottom:h.endsWith(":00")?`1px solid ${T.primary}44`:`1px dashed ${T.primary}22`,padding:"5px 0"}}>
                <span style={{fontFamily:"monospace",fontSize:11,minWidth:44,color:h.endsWith(":00")?T.primaryDark:T.sub,fontWeight:h.endsWith(":00")?700:400}}>{h}</span>
                <input value={reflectDetails[i]?.text||""} onChange={e=>updateReflect(i,"text",e.target.value)} placeholder={h.endsWith(":00")?"what happened...":""} style={{flex:1,border:"none",background:"transparent",fontFamily:"system-ui,sans-serif",fontSize:13,color:T.primaryDark,outline:"none",padding:"4px 0"}}/>
                <div onClick={()=>updateReflect(i,"done",!reflectDetails[i]?.done)} style={{width:22,height:22,border:`2px solid ${reflectDetails[i]?.done?GREEN:`${T.primary}44`}`,borderRadius:6,background:reflectDetails[i]?.done?GREEN:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                  {reflectDetails[i]?.done&&<span style={{color:"#fff",fontSize:13,lineHeight:1}}>✓</span>}
                </div>
              </div>
            ))}
            <div style={{marginTop:20,padding:"14px",background:T.card,borderRadius:12,border:`1px dashed ${T.primary}`}}>
              <p style={{...S.label,marginBottom:4}}>🌙 End of Day Review</p>
              <p style={S.sub}>[annotate & carry over]</p>
              <textarea value={dayData.endOfDay||""} onChange={e=>updateDay("endOfDay",e.target.value)} placeholder="What to carry over to tomorrow..." style={{...S.textarea,height:120,marginBottom:0}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewPage({year,month,day,setDay,store,saveKey,T}){
  const S=makeStyles(T);
  const firstDay=new Date(year,month,1).getDay();
  const dim=new Date(year,month+1,0).getDate();
  const mData=store[monthKey(year,month)]||emptyMonth();
  const updateMonth=(f,v)=>saveKey(monthKey(year,month),{...mData,[f]:v});
  const getPct=(d)=>{const data=store[dateKey(year,month,d)];if(!data)return 0;const total=(data.tasks||[]).filter(t=>t.name).length,done=(data.tasks||[]).filter(t=>t.name&&t.done).length;return total?Math.round((done/total)*100):0;};
  const now=new Date();
  return(
    <div style={{padding:"16px",position:"relative"}}>
      <DotGrid T={T}/>
      <div style={{position:"relative",zIndex:1}}>
        <p style={S.label}>Monthly Overview</p>
        <p style={{fontFamily:"monospace",fontSize:18,color:T.primaryDark,marginBottom:16,fontWeight:500}}>{MONTH_NAMES[month]} {year}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:20}}>
          {DAY_SHORT.map((d,i)=><div key={i} style={{textAlign:"center",fontFamily:"system-ui,sans-serif",fontSize:10,color:T.primaryDark,fontWeight:700,paddingBottom:4}}>{d}</div>)}
          {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:dim}).map((_,i)=>{
            const d=i+1;
            const isSel=d===day;
            const isToday=d===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
            const pct=getPct(d);
            const has=!!(store[dateKey(year,month,d)]);
            return(
              <div key={d} onClick={()=>setDay(d)} style={{border:`2px solid ${isSel?T.primary:isToday?T.primary+"88":T.border}`,borderRadius:10,padding:"4px 2px",minHeight:42,background:isSel?`${T.primary}22`:has?`${T.primary}08`:T.card,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer"}}>
                <span style={{fontFamily:"monospace",fontSize:12,color:isSel?T.primaryDark:isToday?T.primary:T.sub,fontWeight:isSel||isToday?700:400}}>{d}</span>
                {has&&pct>0&&<div style={{width:"70%",height:3,borderRadius:2,background:T.border,marginTop:3}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?GREEN:T.primary,borderRadius:2}}/></div>}
              </div>
            );
          })}
        </div>
        <p style={S.label}>Monthly Goals</p>
        <textarea value={mData.goals||""} onChange={e=>updateMonth("goals",e.target.value)} placeholder="What do you want to accomplish this month?" style={{...S.textarea,height:100}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:16}}>
          {[
            ["📅","Days Logged",Object.keys(store).filter(k=>k.startsWith(`day:${year}-${String(month+1).padStart(2,"0")}`)).length],
            ["✅","Tasks Done",Object.keys(store).filter(k=>k.startsWith(`day:${year}-${String(month+1).padStart(2,"0")}`)).reduce((a,k)=>a+(store[k]?.tasks||[]).filter(t=>t.done).length,0)],
            ["🔥","Habits",(store[habitNamesKey()]||defaultHabits()).length],
          ].map(([icon,l,v])=>(
            <div key={l} style={{background:T.card,borderRadius:12,padding:"12px 8px",textAlign:"center",border:`1px solid ${T.primary}22`}}>
              <p style={{fontSize:18,margin:"0 0 2px"}}>{icon}</p>
              <p style={{fontFamily:"monospace",fontSize:22,color:T.primaryDark,fontWeight:700,margin:0}}>{v}</p>
              <p style={{fontFamily:"system-ui,sans-serif",fontSize:10,color:T.sub,marginTop:2}}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WellbeingPage({dayData,updateDay,T}){
  const S=makeStyles(T);
  return(
    <div style={{padding:"16px",position:"relative"}}>
      <DotGrid T={T}/>
      <div style={{position:"relative",zIndex:1}}>
        <p style={S.label}>Daily Wellbeing</p><p style={S.sub}>check in with yourself 💜</p>
        {[
          {icon:"🌟",title:"Daily Intention",sub:"what's your focus today?",field:"intention",ph:"Today I intend to...",h:60},
          {icon:"🏆",title:"Today's Wins",sub:"even tiny wins count!",field:"wins",ph:"What went well?",h:80},
          {icon:"🙏",title:"Gratitude",sub:"3 things you're grateful for",field:"gratitude",ph:"I'm grateful for...",h:80},
          {icon:"📝",title:"Notes & Thoughts",sub:"",field:"reflectionNotes",ph:"Anything on your mind...",h:100},
        ].map(item=>(
          <div key={item.field} style={S.card}>
            <div style={{padding:"12px 14px"}}>
              <p style={{...S.label,marginBottom:item.sub?2:8}}>{item.icon} {item.title}</p>
              {item.sub&&<p style={S.sub}>{item.sub}</p>}
              <textarea value={dayData[item.field]||""} onChange={e=>updateDay(item.field,e.target.value)} placeholder={item.ph} style={{...S.textarea,height:item.h,border:"none",padding:"0"}}/>
            </div>
          </div>
        ))}
        <div style={S.card}>
          <div style={{padding:"12px 14px"}}>
            <p style={{...S.label,marginBottom:10}}>How are you feeling?</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {MOODS.map(m=><button key={m} onClick={()=>updateDay("mood",dayData.mood===m?"":m)} style={{fontSize:28,background:dayData.mood===m?`${T.primary}22`:"transparent",border:`2px solid ${dayData.mood===m?T.primary:"transparent"}`,borderRadius:12,padding:"4px",cursor:"pointer"}}>{m}</button>)}
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{padding:"12px 14px"}}>
            <p style={{...S.label,marginBottom:10}}>Energy level</p>
            <div style={{display:"flex",gap:8}}>
              {ENERGY.map(e=><button key={e} onClick={()=>updateDay("energy",dayData.energy===e?"":e)} style={{flex:1,fontSize:15,padding:"8px 4px",background:dayData.energy===e?T.primary:T.card,color:dayData.energy===e?"#fff":T.primaryDark,border:`1.5px solid ${dayData.energy===e?T.primary:T.border}`,borderRadius:10,cursor:"pointer",fontFamily:"monospace"}}>{e}</button>)}
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={S.label}>💧 Water intake</p>
              <span style={{fontFamily:"monospace",fontSize:13,color:T.primaryDark,fontWeight:700}}>{dayData.water||0}/8</span>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Array.from({length:8},(_,i)=>(
                <button key={i} onClick={()=>updateDay("water",(dayData.water||0)>i?i:(dayData.water||0)===i+1?0:i+1)} style={{fontSize:22,background:"transparent",border:"none",cursor:"pointer",opacity:i<(dayData.water||0)?1:0.2}}>💧</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:"14px",background:`${T.primary}12`,borderRadius:12,border:`1px dashed ${T.primary}`}}>
          <p style={{...S.label,marginBottom:8}}>💜 ADHD Check-in</p>
          {["Did I eat today?","Did I take my medication?","Did I move my body?","Am I overwhelmed right now?","What do I need right now?","Have I had enough water?"].map((q,i)=>(
            <p key={i} style={{fontFamily:"system-ui,sans-serif",fontSize:12,color:T.primaryDark,marginBottom:6,lineHeight:1.5}}>· {q}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function HabitsPage({year,month,store,saveKey,T}){
  const S=makeStyles(T);
  const dim=new Date(year,month+1,0).getDate();
  const days=Array.from({length:dim},(_,i)=>i+1);
  const now=new Date();
  const habitNames=store[habitNamesKey()]||defaultHabits();
  const hKey=habitsKey(year,month);
  const checked=store[hKey]||{};
  const updateName=(i,v)=>{const n=[...habitNames];n[i]=v;saveKey(habitNamesKey(),n);};
  const toggle=(hi,d)=>{const k=`${hi}-${d}`;saveKey(hKey,{...checked,[k]:!checked[k]});};
  return(
    <div style={{padding:"16px",position:"relative"}}>
      <DotGrid T={T}/>
      <div style={{position:"relative",zIndex:1}}>
        <p style={S.label}>Habit Tracker</p>
        <p style={S.sub}>{MONTH_NAMES[month]} {year} · keep it simple 💜</p>
        {habitNames.map((habit,hi)=>{
          const done=days.filter(d=>checked[`${hi}-${d}`]).length;
          const pct=Math.round((done/dim)*100);
          return(
            <div key={hi} style={S.card}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderBottom:`1px solid ${T.primary}18`}}>
                <input value={habit} onChange={e=>updateName(hi,e.target.value)} placeholder={`Habit ${hi+1}`} style={{flex:1,border:"none",background:"transparent",fontFamily:"system-ui,sans-serif",fontSize:14,fontWeight:600,color:T.primaryDark,outline:"none"}}/>
                <div style={{background:pct>=80?GREEN:pct>=50?T.primary:"#ccc",color:"#fff",borderRadius:20,padding:"2px 10px",fontFamily:"monospace",fontSize:11,fontWeight:700}}>{pct}%</div>
                <button onClick={()=>saveKey(habitNamesKey(),habitNames.filter((_,idx)=>idx!==hi))} style={{background:"none",border:"none",color:T.sub,fontSize:18,cursor:"pointer",padding:"0 4px"}}>×</button>
              </div>
              <div style={{padding:"8px 12px",overflowX:"auto"}}>
                <div style={{display:"flex",gap:4,minWidth:"max-content"}}>
                  {days.map(d=>{
                    const k=`${hi}-${d}`;
                    const isT=d===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
                    return(
                      <div key={d} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <span style={{fontFamily:"monospace",fontSize:9,color:isT?T.primaryDark:T.sub,fontWeight:isT?700:400}}>{d}</span>
                        <div onClick={()=>toggle(hi,d)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${checked[k]?GREEN:isT?T.primary:T.border}`,background:checked[k]?GREEN:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {checked[k]&&<span style={{color:"#fff",fontSize:13,lineHeight:1}}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={()=>saveKey(habitNamesKey(),[...habitNames,""])} style={{...S.ghostBtn,width:"100%",padding:"12px",marginTop:4}}>+ Add Habit</button>
        <div style={{marginTop:14,padding:"12px 14px",background:`${T.primary}12`,borderRadius:12,border:`1px dashed ${T.primary}`}}>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:12,color:T.primaryDark,lineHeight:1.6}}>💡 <strong>ADHD tip:</strong> Start with <strong>2-3 habits</strong>. Consistency beats perfection!</p>
        </div>
      </div>
    </div>
  );
}

function ThemePicker({current,onSelect,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fff",width:"100%",borderRadius:"20px 20px 0 0",padding:"20px 16px 48px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:14,fontWeight:700,color:"#333"}}>Choose Theme</p>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:"#aaa",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {Object.entries(THEMES).map(([key,th])=>(
            <button key={key} onClick={()=>{onSelect(key);onClose();}} style={{padding:"16px 12px",borderRadius:16,border:`2.5px solid ${current===key?th.primary:"#eee"}`,background:th.bg,cursor:"pointer",textAlign:"left"}}>
              <div style={{width:"100%",height:6,borderRadius:3,background:th.primary,marginBottom:10}}/>
              <p style={{fontFamily:"system-ui,sans-serif",fontSize:14,fontWeight:700,color:th.primaryDark}}>{th.name}</p>
              <div style={{display:"flex",gap:4,marginTop:8}}>
                {[th.primary,th.bg,th.accent||th.primaryDark,GREEN].map((c,i)=>(
                  <div key={i} style={{width:16,height:16,borderRadius:4,background:c,border:"1px solid rgba(0,0,0,0.1)"}}/>
                ))}
              </div>
              {current===key&&<p style={{fontFamily:"system-ui,sans-serif",fontSize:10,color:th.primaryDark,marginTop:6,fontWeight:600}}>✓ Active</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataPanel({store,setStore,year,month,day,theme,onClose}){
  const [status,setStatus]=useState(null);
  const fileRef=useRef();
  const T=theme;
  const totalDays=Object.keys(store).filter(k=>k.startsWith("day:")).length;
  const toast=(msg,err=false)=>{setStatus({msg,err});setTimeout(()=>setStatus(null),4000);};

  function exportJSON(){
    const json=JSON.stringify(store,null,2);
    const blob=new Blob([json],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`plasticity-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    toast("✅ Backup downloaded!");
  }

  function exportTxt(){
    const data=store[dateKey(year,month,day)]||emptyDay();
    const ds=new Date(year,month,day).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
    let t=`PLASTICITY PLANNER\n${ds}\n${"=".repeat(44)}\n\n`;
    if(data.mood)t+=`MOOD: ${data.mood}  ENERGY: ${data.energy||"—"}  WATER: ${data.water||0}/8\n\n`;
    if(data.intention)t+=`INTENTION\n${data.intention}\n\n`;
    if(data.brainDump)t+=`BRAIN DUMP\n${data.brainDump}\n\n`;
    const ft=(data.tasks||[]).filter(t2=>t2.name);
    if(ft.length){t+=`KEY TASKS\n`;ft.forEach((tk,i)=>{t+=`${tk.done?"[✓]":"[ ]"} ${i+1}. ${tk.name}\n`;(tk.micros||[]).filter(m=>m).forEach(m=>{t+=`   • ${m}\n`;});});t+="\n";}
    if(data.wins)t+=`TODAY'S WINS\n${data.wins}\n\n`;
    if(data.gratitude)t+=`GRATITUDE\n${data.gratitude}\n\n`;
    if(data.reflectionNotes)t+=`NOTES\n${data.reflectionNotes}\n\n`;
    if(data.endOfDay)t+=`END OF DAY\n${data.endOfDay}\n\n`;
    t+=`${"─".repeat(44)}\nExported ${new Date().toLocaleDateString()}`;
    const blob=new Blob([t],{type:"text/plain"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`planner-${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}.txt`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    toast("✅ Text file downloaded!");
  }

  function importFile(file){
    const r=new FileReader();
    r.onload=e=>{
      try{
        const d=JSON.parse(e.target.result);
        if(typeof d!=="object")throw new Error();
        if(window.confirm(`Restore from ${file.name}? This replaces all current data.`)){
          setStore(d);saveStore(d);toast("✅ Restored!");
        }
      }catch{toast("❌ Invalid backup file.",true);}
    };
    r.readAsText(file);
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:T.bg,width:"100%",borderRadius:"20px 20px 0 0",padding:"20px 16px 50px",maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:14,fontWeight:700,color:T.primaryDark}}>💾 Data & Export</p>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,color:T.sub,cursor:"pointer"}}>✕</button>
        </div>
        <p style={{fontFamily:"system-ui,sans-serif",fontSize:11,color:T.sub,marginBottom:12}}>{totalDays} days saved this session</p>
        {status&&(
          <div style={{margin:"10px 0",padding:"10px 14px",background:status.err?"rgba(200,0,0,0.08)":`${T.primary}18`,borderRadius:10,fontFamily:"system-ui,sans-serif",fontSize:13,color:status.err?"#c00":T.primaryDark,fontWeight:600,textAlign:"center"}}>{status.msg}</div>
        )}
        {[
          {icon:"📥",label:"Download Backup (.json)",desc:"Save all data — restore anytime",action:exportJSON},
          {icon:"📝",label:"Export Today (.txt)",desc:"Plain text for notes or email",action:exportTxt},
        ].map((a,i)=>(
          <div key={i} style={{background:T.card,borderRadius:14,marginBottom:8,border:`1.5px solid ${T.primary}33`}}>
            <button onClick={a.action} style={{width:"100%",background:"none",border:"none",padding:"13px",cursor:"pointer",display:"flex",gap:12,alignItems:"center",textAlign:"left"}}>
              <div style={{width:42,height:42,borderRadius:12,background:`${T.primary}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1}}>
                <p style={{fontFamily:"system-ui,sans-serif",fontSize:13,fontWeight:700,color:T.primaryDark,marginBottom:2}}>{a.label}</p>
                <p style={{fontFamily:"system-ui,sans-serif",fontSize:11,color:T.sub}}>{a.desc}</p>
              </div>
              <span style={{color:T.sub,fontSize:18}}>›</span>
            </button>
          </div>
        ))}
        <div style={{marginTop:8,padding:"14px",background:T.card,borderRadius:14,border:`1.5px solid ${T.primary}33`}}>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:11,fontWeight:700,color:T.primaryDark,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>📂 Restore Backup</p>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:11,color:T.sub,marginBottom:12}}>Upload a .json backup. <strong style={{color:RED}}>Overwrites all current data.</strong></p>
          <button onClick={()=>fileRef.current?.click()} style={{width:"100%",padding:"12px",borderRadius:10,border:`2px dashed ${T.primary}`,background:"transparent",fontFamily:"system-ui,sans-serif",fontSize:13,fontWeight:600,color:T.primaryDark,cursor:"pointer"}}>⬆️ Choose Backup File (.json)</button>
          <input ref={fileRef} type="file" accept=".json" style={{display:"none"}} onChange={e=>{const file=e.target.files?.[0];if(!file)return;importFile(file);e.target.value="";}}/>
        </div>
        <p style={{fontFamily:"system-ui,sans-serif",fontSize:11,color:T.sub,textAlign:"center",marginTop:14,lineHeight:1.6}}>
          💡 Data lives in memory this session.<br/>Download a JSON backup to keep your data.
        </p>
      </div>
    </div>
  );
}

function MonthPicker({year,month,setYear,setMonth,onClose,T}){
  const cy=new Date().getFullYear();
  const years=Array.from({length:5},(_,i)=>cy-1+i);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:T.bg,width:"100%",borderRadius:"20px 20px 0 0",padding:"20px 16px 40px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <p style={{fontFamily:"system-ui,sans-serif",fontSize:14,fontWeight:700,color:T.primaryDark}}>Select Month & Year</p>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:T.sub,cursor:"pointer"}}>✕</button>
        </div>
        {years.map(y=>(
          <div key={y} style={{marginBottom:16}}>
            <p style={{fontFamily:"monospace",fontSize:14,color:T.primaryDark,fontWeight:700,marginBottom:8}}>{y}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {MONTH_NAMES.map((m,mi)=>{
                const a=y===year&&mi===month;
                const c=y===new Date().getFullYear()&&mi===new Date().getMonth();
                return(
                  <button key={mi} onClick={()=>{setYear(y);setMonth(mi);onClose();}} style={{padding:"10px 4px",borderRadius:10,border:`1.5px solid ${a?T.primary:c?T.primary+"66":T.border}`,background:a?T.primary:T.card,color:a?"#fff":T.primaryDark,fontFamily:"system-ui,sans-serif",fontSize:12,fontWeight:a?700:400,cursor:"pointer"}}>{m.slice(0,3)}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAV=[{key:"overview",icon:"🗓",label:"Overview"},{key:"tasks",icon:"✅",label:"Tasks"},{key:"time",icon:"⏱",label:"Time"},{key:"wellbeing",icon:"💜",label:"Wellbeing"},{key:"habits",icon:"🔥",label:"Habits"}];

export default function PlasticityPlanner(){
  const now=new Date();
  const [year,setYear]=useState(now.getFullYear());
  const [month,setMonth]=useState(now.getMonth());
  const [day,setDay]=useState(now.getDate());
  const [tab,setTab]=useState("overview");
  const [showMonthPicker,setShowMonthPicker]=useState(false);
  const [showData,setShowData]=useState(false);
  const [showTheme,setShowTheme]=useState(false);
  const [store,setStore]=useState(()=>loadStore());
  const [currentTheme,setCurrentTheme]=useState(()=>store[appThemeKey()]||"blossom");

  useEffect(()=>{saveStore(store);},[store]);

  const T=THEMES[currentTheme]||THEMES.blossom;
  const saveKey=useCallback((k,v)=>{setStore(p=>({...p,[k]:v}));},[]);
  const dk=dateKey(year,month,day);
  const dayData=store[dk]||emptyDay();
  const updateDay=useCallback((f,v)=>{setStore(p=>{const ex=p[dk]||emptyDay();return{...p,[dk]:{...ex,[f]:v}};});},[dk]);
  const handleThemeSelect=(key)=>{setCurrentTheme(key);setStore(p=>({...p,[appThemeKey()]:key}));};

  const dateStr=new Date(year,month,day).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  const isToday=day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
  const dim=new Date(year,month+1,0).getDate();

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:T.bg,minHeight:"100vh",maxWidth:480,margin:"0 auto",paddingBottom:90,transition:"background 0.3s"}}>

      <div style={{background:T.primary,padding:"16px 16px 12px",position:"sticky",top:0,zIndex:100,boxShadow:`0 2px 12px ${T.primary}40`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:"rgba(255,255,255,0.6)",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>The Complete</p>
            <h1 style={{color:"#fff",fontSize:19,fontWeight:700,margin:0}}>Plasticity Planner {dayData.mood||""}</h1>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setShowTheme(true)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:10,width:36,height:36,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🎨</button>
            <button onClick={()=>setShowData(true)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:10,width:36,height:36,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>💾</button>
            <button onClick={()=>setShowMonthPicker(true)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 10px",cursor:"pointer",textAlign:"right"}}>
              <p style={{color:"rgba(255,255,255,0.9)",fontSize:11,fontFamily:"monospace",margin:0}}>{dateStr}</p>
              <p style={{color:"rgba(255,255,255,0.6)",fontSize:10,margin:"2px 0 0"}}>{MONTH_NAMES[month]} {year} ▾</p>
            </button>
          </div>
        </div>
        {isToday&&<div style={{marginTop:8,background:"rgba(255,255,255,0.18)",borderRadius:8,padding:"4px 10px",display:"inline-block"}}><p style={{color:"rgba(255,255,255,0.95)",fontSize:11,fontWeight:600,margin:0}}>✨ Today</p></div>}
      </div>

      <div style={{background:T.strip,overflowX:"auto",padding:"8px 12px",display:"flex",gap:4}}>
        {Array.from({length:dim},(_,i)=>i+1).map(d=>{
          const has=!!(store[dateKey(year,month,d)]);
          const isRT=d===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
          const dayMood=store[dateKey(year,month,d)]?.mood;
          return(
            <button key={d} onClick={()=>setDay(d)} style={{minWidth:34,height:34,borderRadius:"50%",border:"none",flexShrink:0,background:day===d?T.primary:isRT?`${T.primary}22`:"transparent",color:day===d?"#fff":isRT?T.primaryDark:T.sub,fontSize:12,fontWeight:day===d||isRT?700:400,cursor:"pointer",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {dayMood&&day!==d?<span style={{fontSize:14}}>{dayMood}</span>:d}
              {has&&day!==d&&!dayMood&&<div style={{position:"absolute",bottom:1,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:T.primary}}/>}
            </button>
          );
        })}
      </div>

      <div>
        {tab==="overview"&&<OverviewPage year={year} month={month} day={day} setDay={setDay} store={store} saveKey={saveKey} T={T}/>}
        {tab==="tasks"&&<TasksPage dayData={dayData} updateDay={updateDay} T={T}/>}
        {tab==="time"&&<TimePage dayData={dayData} updateDay={updateDay} T={T}/>}
        {tab==="wellbeing"&&<WellbeingPage dayData={dayData} updateDay={updateDay} T={T}/>}
        {tab==="habits"&&<HabitsPage year={year} month={month} store={store} saveKey={saveKey} T={T}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.nav,backdropFilter:"blur(12px)",borderTop:`1px solid ${T.primary}33`,display:"flex",zIndex:100}}>
        {NAV.map(({key,icon,label})=>(
          <button key={key} onClick={()=>setTab(key)} style={{flex:1,border:"none",background:"none",padding:"8px 2px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer"}}>
            <span style={{fontSize:18}}>{icon}</span>
            <span style={{fontFamily:"system-ui,sans-serif",fontSize:9,fontWeight:tab===key?700:400,color:tab===key?T.primaryDark:T.sub}}>{label}</span>
            {tab===key&&<div style={{width:18,height:2.5,borderRadius:2,background:T.primary,marginTop:1}}/>}
          </button>
        ))}
      </div>

      {showMonthPicker&&<MonthPicker year={year} month={month} setYear={setYear} setMonth={setMonth} onClose={()=>setShowMonthPicker(false)} T={T}/>}
      {showData&&<DataPanel store={store} setStore={setStore} year={year} month={month} day={day} theme={T} onClose={()=>setShowData(false)}/>}
      {showTheme&&<ThemePicker current={currentTheme} onSelect={handleThemeSelect} onClose={()=>setShowTheme(false)}/>}
    </div>
  );
}
