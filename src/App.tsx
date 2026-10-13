import { useEffect, useMemo, useState } from "react";

type IconName =
  | "play" | "pause" | "step" | "reset" | "search" | "grid" | "settings"
  | "cpu" | "pipeline" | "timeline" | "register" | "memory" | "hazard"
  | "wave" | "code" | "chart" | "verify" | "bookmark" | "chevron"
  | "plus" | "more" | "panel" | "command" | "close" | "arrow";

const paths: Record<IconName, React.ReactNode> = {
  play: <path d="m8 5 11 7-11 7Z" />,
  pause: <><path d="M9 5v14M15 5v14" /></>,
  step: <><path d="m6 5 10 7-10 7Z" /><path d="M19 5v14" /></>,
  reset: <><path d="M5 8a8 8 0 1 1-1 7" /><path d="M5 3v5h5" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  grid: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="1" /><path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M18 9h5M1 15h5M18 15h5M10 10h4v4h-4z" /></>,
  pipeline: <><path d="M3 7h5l2 3h4l2-3h5M3 17h5l2-3h4l2 3h5" /><circle cx="3" cy="7" r="1" /><circle cx="21" cy="7" r="1" /></>,
  timeline: <><path d="M3 18V7M8 18V11M13 18V5M18 18V9M22 18H2" /></>,
  register: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 9h16M10 4v16M14 12h3M14 16h3" /></>,
  memory: <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" /><path d="M2 8h3M19 8h3M2 16h3M19 16h3" /></>,
  hazard: <><path d="M12 3 2.8 20h18.4Z" /><path d="M12 9v5M12 17h.01" /></>,
  wave: <path d="M2 13h4V7h4v10h4V9h4v4h4" />,
  code: <><path d="m9 5-7 7 7 7M15 5l7 7-7 7M14 3l-4 18" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  verify: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" /><path d="m9 12 2 2 4-5" /></>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  panel: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M15 4v16" /></>,
  command: <path d="M9 6H6a3 3 0 1 0 3 3V6Zm0 0v12H6a3 3 0 1 1 3-3m6-9h3a3 3 0 1 1-3 3V6Zm0 0v12h3a3 3 0 1 0-3-3" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <><path d="M4 12h16" /><path d="m15 7 5 5-5 5" /></>,
};

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ToolButton({ icon, label, onClick, active, className = "" }: { icon: IconName; label: string; onClick?: () => void; active?: boolean; className?: string }) {
  return <button type="button" className={`tool-button ${active ? "active" : ""} ${className}`} onClick={onClick} title={label}><Icon name={icon} /><span>{label}</span></button>;
}

const nav = [
  { group: "EXECUTION", items: [["Overview", "cpu"], ["Pipeline", "pipeline"], ["Timeline", "timeline"]] },
  { group: "STATE", items: [["Registers", "register"], ["Memory", "memory"], ["Cache", "grid"]] },
  { group: "DEBUG", items: [["Hazards", "hazard"], ["Waveforms", "wave"], ["RTL Explorer", "code"]] },
  { group: "ANALYSIS", items: [["Performance", "chart"], ["Dependencies", "pipeline"], ["State Diff", "register"]] },
  { group: "VERIFY", items: [["Verification", "verify"], ["Assertions", "hazard"]] },
] as const;

const stages = [
  { key: "IF", instruction: "OR x9, x6, x1", pc: "0x0000013C", meta: "FETCH", state: "", src: "PC + 4", dst: "IF/ID" },
  { key: "ID", instruction: "BEQ x7, x0, 0x158", pc: "0x00000138", meta: "BRANCH", state: "branch", src: "x7 · x0", dst: "ID/EX" },
  { key: "EX", instruction: "SUB x6, x5, x3", pc: "0x00000134", meta: "ALU · SUB", state: "hazard", src: "x5 · x3", dst: "x6" },
  { key: "MEM", instruction: "ADD x5, x1, x2", pc: "0x00000130", meta: "BYPASS ACTIVE", state: "forward", src: "x1 · x2", dst: "x5" },
  { key: "WB", instruction: "LW x3, 8(x2)", pc: "0x0000012C", meta: "RETIRING", state: "retire", src: "MEM/WB", dst: "x3" },
];

const timelineRows = [
  { pc: "012C", op: "LW x3, 8(x2)", cells: ["MEM", "WB", "", "", "", "", ""] },
  { pc: "0130", op: "ADD x5, x1, x2", cells: ["EX", "MEM", "WB", "", "", "", ""] },
  { pc: "0134", op: "SUB x6, x5, x3", cells: ["ID", "EX", "MEM", "WB", "", "", ""] },
  { pc: "0138", op: "BEQ x7, x0, 0x158", cells: ["IF", "ID", "EX", "MEM", "WB", "", ""] },
  { pc: "013C", op: "OR x9, x6, x1", cells: ["", "IF", "ID", "EX", "MEM", "WB", ""] },
  { pc: "0140", op: "SW x9, 12(x2)", cells: ["", "", "IF", "ID", "EX", "MEM", "WB"] },
];

const registers = [
  ["x0", "zero", "0x00000000", "—"],
  ["x1", "ra", "0x0000000A", "ADD"],
  ["x2", "sp", "0x00001000", "—"],
  ["x3", "gp", "0x00000013", "LW"],
  ["x5", "t0", "0x0000002A", "ADD"],
  ["x6", "t1", "0x00000017", "SUB"],
];

function PanelHeader({ title, badge, children, onMore }: { title: string; badge?: string; children?: React.ReactNode; onMore: () => void }) {
  return <div className="panel-header"><div className="panel-title">{title}{badge && <span className="title-badge">{badge}</span>}</div><div className="panel-actions">{children}<button className="icon-button" aria-label={`More ${title} options`} onClick={onMore}><Icon name="more" /></button></div></div>;
}

function App() {
  const [cycle, setCycle] = useState(142);
  const [running, setRunning] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedStage, setSelectedStage] = useState(2);
  const [palette, setPalette] = useState(false);
  const [bottomTab, setBottomTab] = useState("Timeline");
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [followPc, setFollowPc] = useState(true);
  const [changedOnly, setChangedOnly] = useState(false);
  const [compact, setCompact] = useState(false);
  const [toast, setToast] = useState("");
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [commandQuery, setCommandQuery] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => current === message ? "" : current), 2200);
  };

  const openWorkspace = (name: string) => {
    setActiveNav(name);
    notify(`${name} workspace opened`);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setCycle((value) => value + 1), 900);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((value) => !value);
      }
      if (event.key === "Escape") setPalette(false);
      if (event.key === " " && !palette) {
        event.preventDefault();
        setRunning((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [palette]);

  const selected = stages[selectedStage];
  const displayCycle = String(cycle).padStart(4, "0");
  const cycleLabels = useMemo(() => Array.from({ length: 7 }, (_, i) => Math.max(0, cycle - 3 + i)), [cycle]);
  const commands = [
    ["step", "Go to Cycle", "Navigate execution history", "G C"],
    [running ? "pause" : "play", running ? "Pause" : "Run", "Control simulator execution", "Space"],
    ["step", "Step", "Advance one processor cycle", "F10"],
    ["reset", "Reset", "Reset the current simulation", "⇧ F10"],
    ["search", "Find Instruction", "Search retired and in-flight instructions", "G I"],
    ["register", "Find Register", "Inspect value and dependencies", "G R"],
    ["wave", "Find Signal", "Search captured waveform signals", "G S"],
    ["code", "Find RTL", "Explore module implementation", "G T"],
    ["hazard", "Find Hazard", "Investigate a causal chain", "G H"],
    ["wave", "Open Waveform", "Open synchronized signal traces", "G W"],
    ["pipeline", "Open Pipeline", "Return to execution datapath", "G P"],
    ["memory", "Open Memory", "Inspect memory at selected cycle", "G M"],
    ["bookmark", "Add Bookmark", `Bookmark cycle ${cycle}`, "⌘ B"],
    ["panel", "Toggle Inspector", "Show or hide investigation panel", "⌘ I"],
    ["grid", "Reset Layout", "Restore full engineering layout", "—"],
  ].filter((command) => `${command[1]} ${command[2]}`.toLowerCase().includes(commandQuery.toLowerCase()));

  const runCommand = (label: string) => {
    if (label === "Go to Cycle" || label === "Step") setCycle((value) => value + 1);
    if (label === "Run") setRunning(true);
    if (label === "Pause") setRunning(false);
    if (label === "Reset") { setCycle(0); setRunning(false); }
    if (label === "Find Register") openWorkspace("Registers");
    if (label === "Find Signal" || label === "Open Waveform") openWorkspace("Waveforms");
    if (label === "Find RTL") openWorkspace("RTL Explorer");
    if (label === "Find Hazard") { openWorkspace("Hazards"); setBottomTab("Hazards"); }
    if (label === "Open Pipeline") openWorkspace("Pipeline");
    if (label === "Open Memory") openWorkspace("Memory");
    if (label === "Toggle Inspector") setInspectorOpen((value) => !value);
    if (label === "Reset Layout") { setInspectorOpen(true); setCompact(false); }
    setPalette(false);
    setCommandQuery("");
    notify(`${label} activated`);
  };

  return (
    <div className={`app-shell ${compact ? "compact-density" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><span /><span /><span /></div>
          <div className="brand-name">QUANTUM<span>RISC</span><b>STUDIO</b></div>
        </div>
        <div className="session">
          <span className="session-label">SESSION</span>
          <span className="session-name">pipeline_cpu_complete</span>
          <span className="connected"><i /> CONNECTED</span>
        </div>
        <div className="execution-controls">
          <ToolButton icon={running ? "pause" : "play"} label={running ? "Pause" : "Run"} onClick={() => setRunning(!running)} active={running} />
          <ToolButton icon="step" label="Step" onClick={() => setCycle((value) => value + 1)} />
          <ToolButton icon="reset" label="Reset" onClick={() => { setCycle(0); setRunning(false); }} />
        </div>
        <div className="cycle-block">
          <span>CYCLE</span><strong>{displayCycle}</strong>
          <div><b>PC</b> 0x00000134</div>
        </div>
        <button className="global-search" onClick={() => setPalette(true)}><Icon name="search" /><span>Search execution, signals, RTL…</span><kbd>⌘ K</kbd></button>
        <div className="top-actions">
          <button className="icon-button" aria-label="Workspace layout" onClick={() => {
            setInspectorOpen((value) => !value);
            notify(inspectorOpen ? "Compact execution layout applied" : "Full engineering layout applied");
          }}><Icon name="grid" /></button>
          <button className="icon-button" aria-label="Toggle inspector" onClick={() => setInspectorOpen(!inspectorOpen)}><Icon name="panel" /></button>
          <button className={`icon-button ${compact ? "active" : ""}`} aria-label="Toggle compact density" onClick={() => {
            setCompact((value) => !value);
            notify(compact ? "Default interface density enabled" : "Compact interface density enabled");
          }}><Icon name="settings" /></button>
        </div>
      </header>

      <div className={`body-grid ${inspectorOpen ? "" : "inspector-closed"}`}>
        <aside className="sidebar">
          <div className="workspace-switcher"><div className="workspace-icon"><Icon name="cpu" /></div><div><b>EXECUTION</b><span>Default workspace</span></div><Icon name="chevron" /></div>
          <nav>
            {nav.map((section) => <div className="nav-section" key={section.group}>
              <div className="nav-label">{section.group}</div>
              {section.items.map(([label, icon]) => <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => openWorkspace(label)}>
                <Icon name={icon as IconName} /><span>{label}</span>{label === "Hazards" && <b className="count warning">2</b>}{label === "Assertions" && <b className="count">12</b>}
              </button>)}
            </div>)}
          </nav>
          <div className="sidebar-footer"><ToolButton icon="plus" label="Save layout" onClick={() => notify("Execution layout saved")} /></div>
        </aside>

        <main className="workspace">
          <section className="execution-header">
            <div className="eyebrow">{activeNav.toUpperCase()} WORKSPACE <span>RISC-V RV32I</span></div>
            <div className="execution-main">
              <div className="big-cycle"><span>CYCLE</span><strong>{displayCycle}</strong></div>
              <div className="header-metric"><span>PROGRAM COUNTER</span><b>0x00000134</b></div>
              <div className="header-metric instruction"><span>CURRENT INSTRUCTION</span><b>SUB <i>x6, x5, x3</i></b></div>
              <div className="header-metric"><span>STATE</span><b className={running ? "run-state" : "paused-state"}><i />{running ? "RUNNING" : "PAUSED"}</b></div>
              <div className="header-metric compact"><span>RETIRED</span><b>{Math.max(0, cycle - 5)}</b></div>
              <div className="header-metric compact"><span>IPC</span><b>0.96</b></div>
            </div>
            <div className="sample-label">DESIGN SAMPLE · SYNCHRONIZED AT CYCLE {displayCycle}</div>
          </section>

          <section className="pipeline-panel panel">
            <PanelHeader title="PIPELINE DATAPATH" badge="5-STAGE" onMore={() => notify("Pipeline display options opened")}>
              <span className="legend"><i className="dot hazard" /> Hazard <i className="dot forward" /> Forward</span>
              <button className={`text-button ${followPc ? "active" : ""}`} onClick={() => {
                setFollowPc((value) => !value);
                notify(followPc ? "Pipeline follow disabled" : "Following current program counter");
              }}>{followPc ? "Following PC" : "Follow PC"}</button>
            </PanelHeader>
            <div className="pipeline-canvas">
              <div className="temporal-axis"><span>T−4</span><span>T−3</span><span>T−2</span><span>T−1</span><b>T · C{displayCycle}</b></div>
              <div className="pipeline-cursor"><span>C{displayCycle}</span></div>
              <div className="pipeline-rail" />
              <div className="forward-path"><span>EX/MEM FORWARD · x5 · 0x0000002A</span><svg viewBox="0 0 400 70" preserveAspectRatio="none"><path d="M390 60 C 315 3, 170 3, 108 56" /></svg></div>
              <div className="stage-row">
                {stages.map((stage, index) => <div key={stage.key} className={`stage ${stage.state} ${selectedStage === index ? "selected" : ""}`} onClick={() => setSelectedStage(index)} onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedStage(index);
                  }
                }} role="button" tabIndex={0}>
                  <div className="stage-top"><strong>{stage.key}</strong><span>{["FETCH", "DECODE", "EXECUTE", "MEMORY", "WRITEBACK"][index]}</span><i>C{Math.max(0, cycle - (4 - index))}</i></div>
                  <div className="stage-body">
                    <div className="stage-pc">{stage.pc}</div>
                    <b>{stage.instruction}</b>
                    <span>{stage.meta}</span>
                  </div>
                  <div className="stage-io"><span><i>IN</i>{stage.src}</span><span><i>OUT</i>{stage.dst}</span></div>
                  {index < stages.length - 1 && <div className="stage-link"><Icon name="arrow" size={14} /></div>}
                  {stage.state === "hazard" && <div className="state-flag"><Icon name="hazard" size={12} /> RAW</div>}
                  {stage.state === "forward" && <div className="state-flag">FWD</div>}
                </div>)}
              </div>
              <div className="datapath-footer">
                <span><b>CONTROL</b> ALUSrc 1 · MemRead 0 · MemWrite 0 · RegWrite 1</span>
                <span className="hazard-message"><Icon name="hazard" size={13} /><b>RAW DEPENDENCY</b> x5 produced by ADD → consumed by SUB</span>
              </div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="timeline-panel panel">
              <PanelHeader title="CYCLE TIMELINE" badge={`C${cycle}`} onMore={() => notify("Timeline display options opened")}>
                <div className="segmented"><button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(50, value - 10))}>−</button><span>{zoom}%</span><button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(200, value + 10))}>+</button></div>
              </PanelHeader>
              <div className="tabs">
                {["Timeline", "Hazards", "Events"].map((tab) => <button key={tab} className={bottomTab === tab ? "active" : ""} onClick={() => setBottomTab(tab)}>{tab}{tab === "Hazards" && <i>2</i>}</button>)}
              </div>
              {bottomTab === "Timeline" ? <div className="timeline">
                <div className="timeline-head"><div>INSTRUCTION</div>{cycleLabels.map((n, index) => <span key={`${n}-${index}`} className={n === cycle ? "current" : ""}>{n}{index === 1 && <i className="bookmark-marker" />}{index === 5 && <i className="breakpoint-marker" />}</span>)}</div>
                {timelineRows.map((row, rowIndex) => <div className="timeline-row" key={row.pc}>
                  <div className="timeline-label"><span>{row.pc}</span><b>{row.op}</b></div>
                  {row.cells.map((cell, index) => <span key={index} role="button" tabIndex={0} onClick={() => {
                    if (rangeStart === null) setCycle(cycleLabels[index]);
                    else {
                      notify(`Cycle range C${Math.min(rangeStart, cycleLabels[index])}–C${Math.max(rangeStart, cycleLabels[index])} selected`);
                      setRangeStart(null);
                    }
                  }} onDoubleClick={() => {
                    setRangeStart(cycleLabels[index]);
                    notify(`Range start set at cycle ${cycleLabels[index]}`);
                  }} className={`${cell ? `cell stage-${cell.toLowerCase()}` : ""} ${cycleLabels[index] === cycle ? "current-col" : ""} ${rangeStart === cycleLabels[index] ? "range-start" : ""} ${rowIndex === 2 && cell === "EX" ? "has-hazard" : ""}`}>{cell}</span>)}
                </div>)}
                <div className="cycle-cursor" />
              </div> : bottomTab === "Hazards" ? <div className="hazard-detail">
                <div className="causal-node producer"><small>PRODUCER · C{Math.max(0, cycle - 1)}</small><b>ADD x5, x1, x2</b><span>writes x5 = 0x0000002A</span></div>
                <Icon name="arrow" /><div className="causal-node alert"><small>RAW HAZARD</small><b>x5 is not yet committed</b><span>resolved without stall</span></div>
                <Icon name="arrow" /><div className="causal-node solution"><small>RESOLUTION</small><b>EX/MEM → EX</b><span>forward 0x0000002A</span></div>
              </div> : <div className="event-list"><span>C{cycle}</span><b>Forwarding path activated</b><code>forward_a = 2'b10</code></div>}
            </div>

            <div className="register-panel panel">
              <PanelHeader title="REGISTER STATE" badge={`C${cycle} · 2 CHANGED`} onMore={() => notify("Register display options opened")}><button className={`text-button ${changedOnly ? "active" : ""}`} onClick={() => setChangedOnly((value) => !value)}>{changedOnly ? "Showing changed" : "Changed only"}</button></PanelHeader>
              <div className="register-head"><span>REG</span><span>ABI</span><span>VALUE</span><span>WRITER</span></div>
              {registers.filter((reg) => !changedOnly || reg[0] === "x5" || reg[0] === "x6").map((reg) => <div className={`register-row ${reg[0] === "x5" || reg[0] === "x6" ? "changed" : ""}`} key={reg[0]}>
                <b>{reg[0]}</b><span>{reg[1]}</span><code>{reg[2]}</code><i>{reg[3]}</i>
              </div>)}
              <div className="register-footer"><span>{changedOnly ? "2 changed" : "32 registers"}</span><button onClick={() => openWorkspace("Registers")}>Open register workspace <Icon name="arrow" size={13} /></button></div>
            </div>
          </section>
        </main>

        {inspectorOpen && <aside className="inspector">
          <PanelHeader title="OBJECT INSPECTOR" onMore={() => notify("Inspector options opened")}><button className="icon-button" onClick={() => setInspectorOpen(false)} aria-label="Close inspector"><Icon name="close" /></button></PanelHeader>
          <div className="investigation-context"><span>INVESTIGATION</span><b>CYCLE {displayCycle}</b><i>RAW DEPENDENCY</i></div>
          <div className="inspector-type"><div className={`object-glyph ${selected.state}`}><Icon name="pipeline" /></div><div><span>INSTRUCTION · {selected.key} STAGE</span><b>{selected.instruction}</b><code>{selected.pc}</code></div></div>
          <div className="inspector-section">
            <div className="section-label">EXECUTION</div>
            <dl><div><dt>Cycle</dt><dd>{cycle}</dd></div><div><dt>Stage</dt><dd className="cyan">{selected.key} · {["Fetch", "Decode", "Execute", "Memory", "Writeback"][selectedStage]}</dd></div><div><dt>Opcode</dt><dd>0x40328333</dd></div><div><dt>Status</dt><dd><span className="status-chip">ACTIVE</span></dd></div></dl>
          </div>
          <div className="inspector-section">
            <div className="section-label">OPERANDS</div>
            <div className="operand"><span>READ A</span><b>x5 <i>t0</i></b><code>0x0000002A</code></div>
            <div className="operand"><span>READ B</span><b>x3 <i>gp</i></b><code>0x00000013</code></div>
            <div className="operand write"><span>WRITE</span><b>x6 <i>t1</i></b><code>0x00000017</code></div>
          </div>
          <div className="inspector-section">
            <div className="section-label">DATA DEPENDENCY</div>
            <div className="dependency">
              <div><span className="dep-node">ADD</span><small>C{Math.max(0, cycle - 1)} · MEM</small></div>
              <div className="dep-line"><span>FORWARD x5</span></div>
              <div><span className="dep-node active">SUB</span><small>C{cycle} · EX</small></div>
            </div>
          </div>
          <div className="inspector-section">
            <div className="section-label">FORWARDING</div>
            <dl><div><dt>Route</dt><dd className="forward-value">EX/MEM → EX</dd></div><div><dt>Register</dt><dd>x5 · t0</dd></div><div><dt>Value</dt><dd>0x0000002A</dd></div><div><dt>Cycle</dt><dd>{Math.max(0, cycle - 1)} → {cycle}</dd></div></dl>
          </div>
          <div className="inspector-section">
            <div className="section-label">RELEVANT SIGNALS</div>
            <button className="signal-link" onClick={() => openWorkspace("Waveforms")}><span>forward_a</span><code>2'b10</code><i>↗</i></button>
            <button className="signal-link" onClick={() => openWorkspace("Waveforms")}><span>alu_result</span><code>0x00000017</code><i>↗</i></button>
          </div>
          <div className="inspector-section source">
            <div className="section-label">RTL SOURCE</div>
            <button onClick={() => openWorkspace("RTL Explorer")}><Icon name="code" /><span><b>execute_stage.sv</b><small>Line 184 · alu_result</small></span><Icon name="chevron" /></button>
          </div>
          <div className="inspector-actions">
            <button onClick={() => { openWorkspace("Pipeline"); setSelectedStage(2); }}>Reveal in Pipeline</button>
            <button onClick={() => { setBottomTab("Timeline"); notify(`Cycle ${cycle} revealed in timeline`); }}>Reveal in Timeline</button>
            <button onClick={() => openWorkspace("Waveforms")}>Reveal in Waveform</button>
            <button onClick={() => openWorkspace("RTL Explorer")}>Reveal in RTL</button>
            <button onClick={() => notify("Producer ADD x5 selected")}>Trace Producer</button>
            <button onClick={() => notify("2 consumers highlighted")}>Trace Consumers</button>
          </div>
        </aside>}
      </div>

      <footer className="statusbar">
        <div><span className="connected-mini"><i /> SIMULATOR CONNECTED</span><span>iverilog · RV32I</span><span>1 ns resolution</span></div>
        <div><span><Icon name="hazard" size={12} /> 2 hazards</span><span>0 errors</span><span>6 warnings</span><span className="mono">CYCLE {displayCycle}</span></div>
      </footer>

      {palette && <div className="modal-backdrop" onMouseDown={() => setPalette(false)}>
        <div className="command-palette" onMouseDown={(event) => event.stopPropagation()}>
          <div className="command-input"><Icon name="search" /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Search commands, cycles, signals, registers…" /><kbd>ESC</kbd></div>
          <div className="command-context">QUICK ACTIONS</div>
          <div className="command-results">{commands.map(([icon, label, detail, key], index) => <button className={`command-row ${index === 0 ? "selected" : ""}`} key={label} onClick={() => runCommand(label)}>
            <span className="command-icon"><Icon name={icon as IconName} /></span><span><b>{label}</b><small>{detail}</small></span><kbd>{key}</kbd>
          </button>)}</div>
          <div className="command-footer"><span><kbd>↑↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span className="brand-mini">QR / COMMAND</span></div>
        </div>
      </div>}
      {toast && <div className="action-toast" role="status"><span className="toast-indicator" /><b>{toast}</b><small>QUANTUMRISC STUDIO</small></div>}
    </div>
  );
}

export default App;
