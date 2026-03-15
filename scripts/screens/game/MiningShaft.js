import { SE } from '../../core/SoundEngine.js';
import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { mountMiningVisualizer } from '../../core/VisualEngine.js';

export function createMiningShaftScreen() {
    let viewer3d = null, tickFn = null, cooldown = false, visualizer = null;

    function upd() {
        const m = GameState.mining, r = GameState.reactor, $ = id => document.getElementById(id);
        const on = m.online && r.efficiency > 0;
        const s=$('ms-status'); if(s){s.textContent=on?'ACTIVE':r.efficiency===0?'HALTED':'OFFLINE';s.style.color=on?'#14fdce':'#ff2222';}
        const e=$('ms-eff');    if(e){const p=Math.round(r.efficiency*100);e.textContent=`${p}%`;e.style.color=p>60?'#14fdce':p>30?'#ff8800':'#ff2222';}
        const rw=$('ms-raw');   if(rw)rw.textContent=Math.floor(m.rawOres);
        const tot=$('ms-tot');  if(tot)tot.textContent=Math.floor(m.totalMined);
        const rt=$('ms-rate');  if(rt)rt.textContent=`${m.ratePerTick.toFixed(2)}/s`;
        const btn=$('ms-mine'); if(btn){const ok=!cooldown&&r.efficiency>0&&m.online;btn.disabled=!ok;btn.style.opacity=ok?'1':'0.35';}
        const tog=$('ms-toggle'); if(tog){tog.textContent=m.online?'SHUT DOWN':'START MINING';tog.className=`btn ${m.online?'btn-danger':''}`; }
    }

    return {
        async render() {
            const m = GameState.mining, r = GameState.reactor, on = m.online && r.efficiency > 0;
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>MINING SHAFT</h1>
                <h2>EXTRACTION LEVEL ${m.upgradeLevel}</h2>
                <div class="panel">
                  <div class="panel-title">SHAFT STATUS</div>
                  <div class="stat-row"><span class="key">STATUS</span><span class="val" id="ms-status" style="color:${on?'#14fdce':'#ff2222'}">${on?'ACTIVE':'OFFLINE'}</span></div>
                  <div class="stat-row"><span class="key">REACTOR EFF.</span><span class="val" id="ms-eff">${Math.round(r.efficiency*100)}%</span></div>
                  <div class="stat-row"><span class="key">AUTO-MINE RATE</span><span class="val" id="ms-rate">${m.ratePerTick.toFixed(2)}/s</span></div>
                </div>
                <div class="panel">
                  <div class="panel-title">INVENTORY</div>
                  <div class="stat-row"><span class="key">RAW ORES</span><span class="val value-ore" id="ms-raw">${Math.floor(m.rawOres)}</span></div>
                  <div class="stat-row"><span class="key">TOTAL MINED</span><span class="val value-dim" id="ms-tot">${Math.floor(m.totalMined)}</span></div>
                </div>
                <div class="panel">
                  <div class="panel-title">MANUAL EXTRACTION</div>
                  <p class="label" style="margin-bottom:0.75rem;">Each press yields bonus ores scaled by reactor output and shaft level.</p>
                  <button id="ms-mine" class="btn btn-primary" style="width:100%;max-width:240px;padding:10px;font-size:1.6rem;letter-spacing:4px;">[ MINE ]</button>
                  <div id="ms-fb" style="height:1.4rem;margin-top:6px;font-size:1rem;color:#14fdce;"></div>
                </div>
                <div class="label" style="line-height:2;">
                  <div>> Auto-mining every tick, scaled by reactor efficiency</div>
                  <div>> Raw ores flow to Ore Refinery automatically</div>
                  <div>> Upgrade shaft in Workshop for higher yield</div>
                </div>
                <button id="ms-toggle" class="btn ${GameState.mining.online?'btn-danger':''}" style="width:100%;max-width:260px;padding:8px;font-size:1.1rem;letter-spacing:3px;margin-top:0.3rem;">
                  ${GameState.mining.online?'SHUT DOWN':'START MINING'}
                </button>
              </div>
              <div class="dept-sidebar">
                ${dept3DPanel('canvas-mining','MINING SHAFT')}
                <div class="panel" style="padding:0;overflow:hidden;">
                  <div class="panel-title" style="padding:4px 8px;">// LIVE SHAFT FEED</div>
                  <canvas id="canvas-mining-vis" style="display:block;width:100%;"></canvas>
                </div>
                <div class="panel mini-stats">
                  <div class="panel-title">TELEMETRY</div>
                  <p>DEPTH<span>${m.upgradeLevel * 150}m</span></p>
                  <p>DRILLS<span>${m.upgradeLevel}</span></p>
                  <p>PWR DRAW<span>${(m.upgradeLevel*0.2).toFixed(1)} GW</span></p>
                  <p>SHAFT LVL<span>${m.upgradeLevel}</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn = () => upd();
            GameState.on('tick', tickFn);
            document.getElementById('ms-toggle')?.addEventListener('click', () => {
                GameState.mining.online = !GameState.mining.online;
                if (GameState.mining.online) GameState.addLog('Mining shaft restarted manually', 'ok');
                upd();
            });
            document.getElementById('ms-mine')?.addEventListener('click', () => {
                if (cooldown || GameState.reactor.efficiency === 0) return;
                const bonus = Math.ceil(2 + GameState.reactor.efficiency * 3 * GameState.mining.upgradeLevel);
                SE.mine();
                GameState.mining.rawOres += bonus; GameState.mining.totalMined += bonus;
                const fb = document.getElementById('ms-fb');
                if (fb) { fb.textContent = `+${bonus} RAW ORE`; setTimeout(() => { if(fb) fb.textContent=''; }, 700); }
                cooldown = true; upd(); setTimeout(() => { cooldown = false; upd(); }, 500);
            });
            viewer3d = mountDeptModel('canvas-mining', 'miningshaft', {
                cz: 3.8,
                animate: (model, _, t) => {
                    if (model.children[3]) model.children[3].position.y = -1.25 + Math.sin(t * 0.003) * 0.06;
                }
            });
            visualizer = mountMiningVisualizer('canvas-mining-vis');
        },

        onExit() {
            if (tickFn && GameState._listeners['tick']) GameState._listeners['tick'] = GameState._listeners['tick'].filter(f => f !== tickFn);
            viewer3d?.dispose();
            visualizer?.destroy();
        }
    };
}
