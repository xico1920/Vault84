import { deleteSave, BUILD_VERSION, getSaveVersion } from '../core/SaveSystem.js';
const t = k => window.t?.(k) ?? k;

export function createDeprecatedScreen(screenManager) {
    return {
        render() {
            const oldVersion = getSaveVersion() || 'UNKNOWN';
            return `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:2rem;">
              <div style="max-width:480px;width:100%;text-align:center;">

                <div style="font-family:'VT323',monospace;font-size:0.7rem;color:#1a5a35;letter-spacing:4px;margin-bottom:2rem;">
                  VOLTEC SYSTEMS — VAULT 84
                </div>

                <div style="font-family:'VT323',monospace;font-size:3.5rem;color:#ff2222;letter-spacing:6px;line-height:1;margin-bottom:0.5rem;
                  text-shadow:0 0 20px rgba(255,34,34,0.5);">
                  ⚠
                </div>

                <div style="font-family:'VT323',monospace;font-size:1.4rem;color:#ff8800;letter-spacing:4px;margin-bottom:2rem;">
                  ${t('dep_title')}
                </div>

                <div style="border:1px solid #1a3a20;background:rgba(0,0,0,0.4);padding:1.2rem;margin-bottom:2rem;text-align:left;">
                  <div style="font-family:'VT323',monospace;font-size:0.82rem;color:#3d9970;line-height:2;letter-spacing:1px;">
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:#1a5a35;">${t('dep_save_ver')}</span>
                      <span style="color:#ff8800;">${oldVersion}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:#1a5a35;">${t('dep_build')}</span>
                      <span style="color:#14fdce;">${BUILD_VERSION}</span>
                    </div>
                    <div style="border-top:1px solid #0d2a18;margin-top:0.75rem;padding-top:0.75rem;color:#3d9970;font-size:0.75rem;line-height:1.8;">
                      ${t('dep_desc')}
                    </div>
                  </div>
                </div>

                <div style="font-family:'VT323',monospace;font-size:0.65rem;color:#1a4a2a;letter-spacing:2px;margin-bottom:1.5rem;">
                  ${t('dep_auth')}
                </div>

                <button id="dep-new-game" style="
                  width:100%;padding:0.9rem;
                  font-family:'VT323',monospace;font-size:1rem;letter-spacing:4px;
                  background:transparent;border:1px solid #14fdce;color:#14fdce;
                  cursor:pointer;transition:background 0.15s;
                ">${t('dep_btn')}</button>

              </div>
            </div>`;
        },

        onRendered() {
            document.getElementById('dep-new-game')?.addEventListener('click', () => {
                if (confirm('Wipe all save data and start a new game?')) {
                    deleteSave();
                    localStorage.removeItem('vault84_difficulty');
                    screenManager.navigateTo('start', null);
                }
            });

            const btn = document.getElementById('dep-new-game');
            if (btn) {
                btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(20,253,206,0.06)');
                btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
            }
        },

        onExit() {}
    };
}
