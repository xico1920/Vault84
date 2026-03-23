// LoreData.js — Vault 84 lore entries
// unlockCash = total cashEarned required to unlock entry body

export const LORE_ENTRIES = [
    // ─── VAULT HISTORY ───────────────────────────────────────────
    {
        id: 'hist_1', type: 'HISTORY', date: '1977-04-12',
        title: 'VAULT 84 COMMISSIONED',
        body: 'Voltec Systems contract V84-001 secured. Estimated completion Q4 1984. Maximum capacity: 200 residents. Primary power source: modular fission reactor, rated 2.4 GW. All specs approved by the Overseer Program.',
        unlockCash: 0,
    },
    {
        id: 'hist_2', type: 'HISTORY', date: '1984-11-30',
        title: 'CONSTRUCTION COMPLETE',
        body: 'Vault 84 sealed on schedule. All primary systems nominal. Reactor temp: 720°C. Initial crew manifest: 83 personnel. Overseer autonomous protocol activated. The door is closed. It will not open again.',
        unlockCash: 0,
    },
    {
        id: 'hist_3', type: 'HISTORY', date: '1985-03-22',
        title: 'INCIDENT REPORT #001',
        body: 'Mining Shaft B-7 structural collapse. 3 extraction units offline for 14 days. No casualties. Internal memo cites "substandard Voltec materials." Formal complaint filed. No response received. Investigation closed by Overseer order.',
        unlockCash: 500,
    },
    {
        id: 'hist_4', type: 'HISTORY', date: '1986-08-14',
        title: 'REACTOR ANOMALY LOG',
        body: 'Core temperature exceeded 1400°C for 47 consecutive minutes. Emergency vent activated at 14:32. Sub-level 3 evacuated. Root cause: water pump wear exceeding tolerance. New maintenance schedule mandated. Three personnel treated for heat exposure.',
        unlockCash: 2000,
    },
    {
        id: 'hist_5', type: 'HISTORY', date: '1987-02-08',
        title: 'SECURITY INCIDENT #004',
        body: 'Unauthorized terminal access detected at 03:47 in Sector GAMMA. Vault resident #44 questioned and cleared of direct involvement. No data breach confirmed. SSM firewall reinforced. Resident #44 reassigned to deep-ore extraction duty.',
        unlockCash: 5000,
    },
    {
        id: 'hist_6', type: 'HISTORY', date: '1989-01-01',
        title: 'COMM BLACKOUT — DAY ZERO',
        body: 'All surface transmissions ceased at 00:01. No signal detected on any frequency. Cause unknown. Vault sealed indefinitely per Protocol 7-C. The Overseer assumes full autonomous command. The surface is no longer our concern. God speed to those who remain above.',
        unlockCash: 10000,
    },

    // ─── INTERCEPTED TRANSMISSIONS ───────────────────────────────
    {
        id: 'trans_1', type: 'TRANSMISSION', date: null,
        title: 'SIGNAL // ALPHA-7',
        body: '...do not open the door... they are not who they claim to be... the surface is not— [signal noise] —do not open the— [CARRIER LOST AT 44.3s]',
        unlockCash: 0,
    },
    {
        id: 'trans_2', type: 'TRANSMISSION', date: null,
        title: 'SIGNAL // BRAVO-12',
        body: 'Vault 85 has gone dark. Last contact approximately 72 hours ago. Requesting immediate assistance on frequency 108.4 MHz. Repeat: Vault 85 is not responding to any— [SIGNAL TERMINATED]',
        unlockCash: 1000,
    },
    {
        id: 'trans_3', type: 'TRANSMISSION', date: null,
        title: 'ENCRYPTED // VOLTEC INTERNAL',
        body: '[AUTO-DECRYPTED] Re: Experiment #84 — subjects responding within expected parameters. Resource extraction metrics running 340% above initial projections. Do not interfere with Overseer directives. Do not attempt contact. Do not send rescue teams.',
        unlockCash: 8000,
    },
    {
        id: 'trans_4', type: 'TRANSMISSION', date: null,
        title: 'BROADCAST // UNKNOWN ORIGIN',
        body: 'If anyone can hear this — there are survivors on the surface. The war ended decades ago. Crops grow again. Water is clean. You can come out. We are here. We are waiting. Please, the coordinates are— [SIGNAL JAMMED]',
        unlockCash: 20000,
    },
    {
        id: 'trans_5', type: 'TRANSMISSION', date: null,
        title: 'DISTRESS // VAULT 91',
        body: 'Vault 91 crew broadcasting on emergency band... reactor critically failing... coordinates corrupted... children are asking about the sky... rations for approximately— [END OF SIGNAL — SOURCE SILENT SINCE BROADCAST]',
        unlockCash: 50000,
    },

    // ─── OVERSEER LOGS ───────────────────────────────────────────
    {
        id: 'over_1', type: 'OVERSEER LOG', date: null,
        title: 'OVERSEER LOG // DAY 1',
        body: 'Systems initialized. All 83 personnel accounted for. The vault is sealed. This is our world now. Keep the reactor running. Keep the people fed. That is the mission. Nothing outside matters anymore.',
        unlockCash: 0,
    },
    {
        id: 'over_2', type: 'OVERSEER LOG', date: null,
        title: 'OVERSEER LOG // DAY 847',
        body: 'Third reactor wear event this month. Maintenance rotation is consistently behind schedule. Water rations reduced by 15% pending pump repair. Morale nominal. The ore numbers look good. Focus on the numbers.',
        unlockCash: 3000,
    },
    {
        id: 'over_3', type: 'OVERSEER LOG', date: null,
        title: 'OVERSEER LOG // DAY 2301',
        body: 'Breach attempt on SSM terminal at 22:18. Unknown origin — possibly internal. Cyber defense protocols held. I do not like that word "possibly." Threat monitoring increased. No one asks about the surface anymore. Good. That is progress.',
        unlockCash: 15000,
    },
    {
        id: 'over_4', type: 'OVERSEER LOG', date: null,
        title: 'OVERSEER LOG // DAY 4096',
        body: 'Power is knowledge. Knowledge is survival. The ore feeds the machine. The machine feeds us. The vault IS us. Those who question this should be reminded that there is nothing outside. Nothing at all. The numbers agree.',
        unlockCash: 40000,
    },
    {
        id: 'over_5', type: 'OVERSEER LOG', date: null,
        title: 'OVERSEER LOG // CURRENT',
        body: 'If you are reading this, the previous Overseer left this terminal unlocked. That tells you something. You are now responsible for Vault 84. The systems need constant management. The people need the systems. The ore funds everything. Do not let it fail. The vault is counting on you.',
        unlockCash: 100000,
    },
];

export const LORE_TYPE_COLORS = {
    'HISTORY':      '#14fdce',
    'TRANSMISSION': '#ff8800',
    'OVERSEER LOG': '#5ecba8',
};
