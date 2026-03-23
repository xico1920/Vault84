import { SE } from '../../core/SoundEngine.js';
import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { mountReactorHeatmap } from '../../core/VisualEngine.js';

export function createReactorCoreScreen() {
    let viewer3d = null, tickFn = null, heatmap = null;

    const tColor = t => t <= 800 ? '#14fdce' : t <= 1000 ? '#d4e800' : t <= 1300 ? '#ff8800' : '#ff2222';
    const sColor = s => ({ ONLINE:'#14fdce', WARNING:'#ff8800', CRITICAL:'#ff2222', OFFLINE:'#3d9970' })[s] || '#14fdce';
    const effBar = e => { const p=Math.round(e*100), n=Math.round(p/5); return `[${'|'.repeat(n)}${'.'.repeat(20-n)}] ${p}%`; };

    function upd() {
        const r = GameState.reactor, $ = id => document.getElementById(id);
        const s=$('rc-status'); if(s){s.textContent=r.status;s.style.color=sColor(r.status);}
        const p=$('rc-power');  if(p){p.textContent=`${(r.powerGW*r.efficiency).toFixed(2)} GW`;p.style.color=r.efficiency>0.6?'#14fdce':'#ff8800';}
        const t=$('rc-temp');   if(t){t.textContent=`${r.temperature}C`;t.style.color=tColor(r.temperature);}
        const e=$('rc-eff');    if(e){e.textContent=effBar(r.efficiency);e.style.color=r.efficiency>0.7?'#14fdce':r.efficiency>0.3?'#ff8800':'#ff2222';}
        const b=$('rc-tbar');   if(b){b.style.width=`${Math.min(100,(r.temperature/1800)*100)}%`;b.style.background=tColor(r.temperature);}
        const tog=$('rc-toggle'); if(tog){tog.textContent=r.online?'SHUT DOWN':'START REACTOR';tog.className=`btn ${r.online?'btn-danger':''}`;}
        const ep=$('rc-emergency-panel'); if(ep){ep.style.display=r.temperature>1200&&r.online?'block':'none';}
    }

    return {
        async render() {
            const r = GameState.reactor;
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>REACTOR CORE</h1>
                <h2>VOLTEC MODEL VII FISSION UNIT</h2>
                <div class="panel">
                  <div class="panel-title">OPERATIONAL STATUS</div>
                  <div class="stat-row"><span class="key">STATUS</span><span class="val" id="rc-status" style="color:${sColor(r.status)}">${r.status}</span></div>
                  <div class="stat-row"><span class="key">POWER OUTPUT</span><span class="val" id="rc-power">${(r.powerGW*r.efficiency).toFixed(2)} GW</span></div>
                </div>
                <div class="panel">
                  <div class="panel-title">THERMAL MANAGEMENT</div>
                  <div class="stat-row"><span class="key">CORE TEMPERATURE</span><span class="val" id="rc-temp" style="color:${tColor(r.temperature)}">${r.temperature}C</span></div>
                  <div class="bar-track"><div class="bar-fill" id="rc-tbar" style="width:${Math.min(100,(r.temperature/1800)*100)}%;background:${tColor(r.temperature)};"></div></div>
                  <div class="label" style="margin-bottom:0.6rem;">0C ──── 1000C [WARN] ──── 1500C [CRIT] ──── 1800C</div>
                  <div class="stat-row"><span class="key">EFFICIENCY</span><span class="val" id="rc-eff" style="font-size:0.85rem;">${effBar(r.efficiency)}</span></div>
                  <div class="label" style="margin-top:0.4rem;">Cooling is handled by the Water Treatment pump. Upgrade Water to increase cooling capacity.</div>
                </div>
                <div class="panel" id="rc-emergency-panel" style="display:${r.temperature>1200?'block':'none'};border-color:#ff2222;">
                  <div class="panel-title" style="color:#ff2222;">!! EMERGENCY VENT</div>
                  <div class="label" style="margin-bottom:0.5rem;">Dump reactor power to reduce temperature by ~400°C. Reactor goes offline for 30s. Free — no cash required.</div>
                  <button id="rc-vent" class="btn btn-danger" style="width:100%;max-width:260px;padding:8px;letter-spacing:2px;">EMERGENCY VENT</button>
                </div>
                <button id="rc-toggle" class="btn ${r.online?'btn-danger':''}" style="width:100%;max-width:260px;margin-top:0.5rem;padding:8px;font-size:1.1rem;letter-spacing:3px;">
                  ${r.online?'SHUT DOWN':'START REACTOR'}
                </button>
              </div>
              <div class="dept-sidebar">
                ${dept3DPanel('canvas-reactor','REACTOR CORE')}
                <div class="panel" style="padding:0;overflow:hidden;">
                  <div class="panel-title" style="padding:4px 8px;">// CORE THERMAL MAP</div>
                  <canvas id="canvas-reactor-heat" style="display:block;width:100%;image-rendering:pixelated;"></canvas>
                </div>
                <div class="panel mini-stats">
                  <div class="panel-title">SPECS</div>
                  <p>MODEL<span>VOLTEC VII</span></p>
                  <p>OUTPUT<span>${r.powerGW} GW NOMINAL</span></p>
                  <p>COOLING<span>${r.coolantFlow.toUpperCase()}</span></p>
                  <p>LEVEL<span>${r.upgradeLevel}</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            document.getElementById('rc-toggle')?.addEventListener('click', () => {
                GameState.reactor.online = !GameState.reactor.online;
                GameState.reactor.online ? SE.reactorOnline() : SE.error();
                upd();
            });
            document.getElementById('rc-vent')?.addEventListener('click', () => {
                if (GameState.reactor.temperature <= 1200) return;
                GameState.reactor.online = false;
                GameState.reactor.temperature = Math.max(300, GameState.reactor.temperature - 400);
                GameState.addLog('EMERGENCY VENT — reactor offline, temp reduced', 'warn');
                SE.error();
                upd();
                // Auto-restart after 30s
                setTimeout(() => {
                    GameState.reactor.online = true;
                    GameState.addLog('Reactor restarted after emergency vent', 'ok');
                    SE.reactorOnline();
                }, 30000);
            });
            tickFn = () => upd();
            GameState.on('tick', tickFn);
            heatmap = mountReactorHeatmap('canvas-reactor-heat');
            viewer3d = mountDeptModel('canvas-reactor', 'reactorcore', {
                cz: 3.2,
                animate: (model, _, t) => { model.children[0] && (model.children[0].rotation.y = t * 0.0008); }
            });
        },

        onExit() {
            if (tickFn && GameState._listeners['tick']) GameState._listeners['tick'] = GameState._listeners['tick'].filter(f => f !== tickFn);
            viewer3d?.dispose();
            heatmap?.destroy();
        }
    };
}
