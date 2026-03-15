// AchievementSystem.js

export const ACHIEVEMENTS = [
    { id: 'first_ore',       label: 'FIRST EXTRACTION',    desc: 'Mine your first ore.',                     icon: '⛏',  check: gs => gs.mining.totalMined >= 1 },
    { id: 'cash_1k',         label: 'PETTY CASH',          desc: 'Accumulate 1,000$.',                       icon: '💰', check: gs => gs.session.cashEarned >= 1000 },
    { id: 'cash_100k',       label: 'VAULT ECONOMY',       desc: 'Accumulate 100,000$.',                     icon: '💰', check: gs => gs.session.cashEarned >= 100000 },
    { id: 'threat_1',        label: 'FIRST RESPONSE',      desc: 'Resolve your first threat.',               icon: '🛡',  check: gs => gs.session.threatsResolved >= 1 },
    { id: 'threat_10',       label: 'CYBER DEFENDER',      desc: 'Resolve 10 threats.',                      icon: '🛡',  check: gs => gs.session.threatsResolved >= 10 },
    { id: 'meltdown',        label: 'CRISIS AVERTED',      desc: 'Prevent a reactor meltdown.',              icon: '☢',  check: gs => gs.session.meltdownsAvoided >= 1 },
    { id: 'ore_1k',          label: 'DEEP VEIN',           desc: 'Mine 1,000 total ores.',                   icon: '⛏',  check: gs => gs.mining.totalMined >= 1000 },
    { id: 'repair_5',        label: 'MAINTENANCE CREW',    desc: 'Repair systems 5 times.',                  icon: '🔧', check: gs => gs.session.repairsPerformed >= 5 },
    { id: 'upgrade_5',       label: 'ENGINEER',            desc: 'Purchase 5 upgrades.',                     icon: '⚙',  check: gs => Object.values(gs.workshop.upgrades).reduce((a, u) => a + (u.level - 1), 0) >= 5 },
    { id: 'all_online',      label: 'FULL OPERATION',      desc: 'Have all systems online simultaneously.',  icon: '✓',  check: gs => gs.reactor.online && gs.mining.online && gs.refinery.online && gs.water.pumpOnline },
    { id: 'nightmare',       label: 'ADMINISTRATOR',       desc: 'Start a game on Nightmare difficulty.',    icon: '💀', check: gs => gs.difficulty === 'NIGHTMARE' },
    { id: 'temp_critical',   label: 'LIVING DANGEROUSLY',  desc: 'Survive reactor temp above 1400°C.',       icon: '🔥', check: gs => gs.reactor.temperature >= 1400 && gs.reactor.online },
];

export function checkAchievements(GameState) {
    const earned = [];
    ACHIEVEMENTS.forEach(a => {
        if (GameState.achievements.includes(a.id)) return;
        try {
            if (a.check(GameState)) {
                GameState.achievements.push(a.id);
                earned.push(a);
            }
        } catch(e) {}
    });
    return earned;
}
