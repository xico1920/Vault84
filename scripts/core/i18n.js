// i18n.js — PT / EN translation system

export const LANG_KEY = 'vault84_lang';

const STRINGS = {
    EN: {
        // Physical controls
        dial_brightness: 'BRIGHTNESS',
        dial_contrast:   'CONTRAST',

        // Nav
        nav_status:           'STATUS',
        nav_reactorcore:      'REACTOR',
        nav_miningshaft:      'MINING',
        nav_orerefinery:      'REFINERY',
        nav_watertreatment:   'WATER',
        nav_ssm:              'SSM',
        nav_workshop:         'WORKSHOP',
        nav_security:         'SECURITY',
        nav_music:            'MUSIC',
        nav_credits:          'CREDITS',
        nav_settings:         'SETTINGS',

        // HUD
        hud_treasury: 'TREASURY',
        hud_power:    'POWER',
        hud_temp:     'TEMP',
        hud_sec:      'SEC',
        hud_log:      '// EVENT LOG',

        // Status screen
        st_title:        'STATUS',
        st_sub:          'VAULT 84 OPERATIONS OVERVIEW',
        st_treasury:     'TREASURY',
        st_power_grid:   'POWER GRID',
        st_output:       'OUTPUT',
        st_reactor:      'REACTOR',
        st_mining:       'MINING',
        st_refinery:     'REFINERY',
        st_water:        'WATER',
        st_security:     'SECURITY',
        st_ssm:          'SSM',
        st_alerts:       'ALERTS',
        st_session:      'SESSION STATS',
        st_achievements: '// ACHIEVEMENTS',
        st_terminal:     '// TERMINAL ARCHIVE',
        st_facility_map: '// FACILITY MAP',
        st_click_nav:    'CLICK TO NAVIGATE',
        st_best_runs:    'BEST RUNS',

        // Settings
        set_title:       'SETTINGS',
        set_sub:         'SYSTEM CONFIGURATION',
        set_language:    'LANGUAGE',
        set_audio:       'AUDIO',
        set_bg_music:    'BACKGROUND MUSIC',
        set_sfx:         'SOUND EFFECTS',
        set_general:     'GENERAL',
        set_autosave:    'Game saves automatically every 30 seconds.',
        set_lore_btn:    'VIEW LORE',
        set_tutorial_btn:'VIEW TUTORIAL AGAIN',
        set_clear_btn:   'WIPE ALL DATA &amp; RESTART',
        set_save_data:   'SAVE DATA',
        set_save_desc:   'Export your save as a JSON file, or import a previously exported save.',
        set_export_btn:  'EXPORT SAVE',
        set_import_btn:  'IMPORT SAVE',
        set_best_runs:   '// BEST RUNS',
        set_about:       'ABOUT',
        set_shortcuts:   'KEYBOARD SHORTCUTS',
        set_system:      'SYSTEM',

        // Deprecated save screen
        dep_title:     'SAVE DATA DEPRECATED',
        dep_save_ver:  'SAVE VERSION',
        dep_build:     'CURRENT BUILD',
        dep_desc:      'The existing save file is incompatible with this version of Vault 84. Loading it may cause system instability or data corruption. A fresh deployment is required.',
        dep_btn:       'WIPE SAVE &amp; BEGIN NEW DEPLOYMENT',
        dep_auth:      '// OVERSEER AUTHORISATION REQUIRED TO PROCEED',

        // Reactor Core
        rc_h1:              'REACTOR CORE',
        rc_op_status:       'OPERATIONAL STATUS',
        rc_thermal:         'THERMAL MANAGEMENT',
        rc_cooling_desc:    'Cooling is handled by the Water Treatment pump. Upgrade Water to increase cooling capacity.',
        rc_emergency_title: '!! EMERGENCY VENT',
        rc_vent_desc:       'Dump reactor power to reduce temperature by ~400°C. Reactor goes offline for 30s. Free — no cash required.',
        rc_vent_btn:        'EMERGENCY VENT',
        rc_shutdown:        'SHUT DOWN',
        rc_start_reactor:   'START REACTOR',
        rc_thermal_map:     '// CORE THERMAL MAP',
        rc_specs:           'SPECS',

        // Mining Shaft
        ms_h1:          'MINING SHAFT',
        ms_shaft_status:'SHAFT STATUS',
        ms_inventory:   'INVENTORY',
        ms_manual:      'MANUAL EXTRACTION',
        ms_manual_desc: 'Each press yields bonus ores scaled by reactor output and shaft level.',
        ms_shutdown:    'SHUT DOWN',
        ms_start:       'START MINING',
        ms_live_feed:   '// LIVE SHAFT FEED',
        ms_telemetry:   'TELEMETRY',

        // Ore Refinery
        or_h1:          'ORE REFINERY',
        or_h2:          'THERMAL PROCESSING UNIT',
        or_flow:        'FLOW',
        or_manual:      'MANUAL PROCESSING',
        or_manual_desc: 'Consume 5 raw ores instantly for a burst of refined output. Useful when auto-refine is slow.',
        or_eff_factors: 'EFFICIENCY FACTORS',
        or_shutdown:    'SHUT DOWN',
        or_start:       'START REFINERY',
        or_specs:       'SPECS',

        // Water Treatment
        wt_h1:          'WATER TREATMENT',
        wt_h2:          'COOLANT CIRCULATION PLANT',
        wt_pump:        'PUMP STATUS',
        wt_thermal_feed:'REACTOR THERMAL FEED',
        wt_pump_desc:   'Pump keeps reactor below critical threshold.',
        wt_shutdown:    'SHUTDOWN PUMP',
        wt_start:       'START PUMP',
        wt_specs:       'SPECS',

        // Smart Storage (SSM)
        ssm_h2:         'SMART STORAGE MANAGEMENT',
        ssm_inventory:  'INVENTORY',
        ssm_autosell:   'AUTO-SELL',
        ssm_sell_target:'SELL TARGET',
        ssm_sell_all:   'SELL ALL',
        ssm_sell_raw:   'SELL RAW',
        ssm_sell_refined:'SELL REFINED',
        ssm_market:     'MARKET',

        // Workshop
        ws_h2:          'SYSTEMS UPGRADE BAY',
        ws_funds:       'AVAILABLE FUNDS',
        ws_power_budget:'POWER BUDGET',
        ws_upgrade:     'UPGRADE',

        // Security
        sec_h2:         'VAULT DEFENSE SYSTEM',
        sec_threats:    'THREAT ACTIVITY',
        sec_maintenance:'MAINTENANCE',

        // Music
        mus_h2:         'VAULT 84 AUDIO SYSTEM',
        mus_now_playing:'// NOW PLAYING',
        mus_tracklist:  '// TRACK LIST',
    },
    PT: {
        // Physical controls
        dial_brightness: 'BRILHO',
        dial_contrast:   'CONTRASTE',

        // Nav
        nav_status:           'ESTADO',
        nav_reactorcore:      'REACTOR',
        nav_miningshaft:      'MINERAÇÃO',
        nav_orerefinery:      'REFINARIA',
        nav_watertreatment:   'ÁGUA',
        nav_ssm:              'SSM',
        nav_workshop:         'OFICINA',
        nav_security:         'SEGURANÇA',
        nav_music:            'MÚSICA',
        nav_credits:          'CRÉDITOS',
        nav_settings:         'DEFINIÇÕES',

        // HUD
        hud_treasury: 'FUNDOS',
        hud_power:    'ENERGIA',
        hud_temp:     'TEMP',
        hud_sec:      'SEG',
        hud_log:      '// REGISTO',

        // Status screen
        st_title:        'ESTADO',
        st_sub:          'VISÃO GERAL DO VAULT 84',
        st_treasury:     'TESOURO',
        st_power_grid:   'REDE ELÉTRICA',
        st_output:       'SAÍDA',
        st_reactor:      'REACTOR',
        st_mining:       'MINERAÇÃO',
        st_refinery:     'REFINARIA',
        st_water:        'ÁGUA',
        st_security:     'SEGURANÇA',
        st_ssm:          'SSM',
        st_alerts:       'ALERTAS',
        st_session:      'ESTATÍSTICAS',
        st_achievements: '// CONQUISTAS',
        st_terminal:     '// ARQUIVO TERMINAL',
        st_facility_map: '// MAPA DA INSTALAÇÃO',
        st_click_nav:    'CLICAR PARA NAVEGAR',
        st_best_runs:    'MELHORES CORRIDAS',

        // Settings
        set_title:       'DEFINIÇÕES',
        set_sub:         'CONFIGURAÇÃO DO SISTEMA',
        set_language:    'IDIOMA',
        set_audio:       'ÁUDIO',
        set_bg_music:    'MÚSICA DE FUNDO',
        set_sfx:         'EFEITOS DE SOM',
        set_general:     'GERAL',
        set_autosave:    'O jogo guarda automaticamente de 30 em 30 segundos.',
        set_lore_btn:    'VER LORE',
        set_tutorial_btn:'VER TUTORIAL NOVAMENTE',
        set_clear_btn:   'APAGAR DADOS E REINICIAR',
        set_save_data:   'DADOS GUARDADOS',
        set_save_desc:   'Exporta o teu save como ficheiro JSON, ou importa um save anteriormente exportado.',
        set_export_btn:  'EXPORTAR SAVE',
        set_import_btn:  'IMPORTAR SAVE',
        set_best_runs:   '// MELHORES CORRIDAS',
        set_about:       'SOBRE',
        set_shortcuts:   'ATALHOS DE TECLADO',
        set_system:      'SISTEMA',

        // Deprecated save screen
        dep_title:     'DADOS DESATUALIZADOS',
        dep_save_ver:  'VERSÃO DO SAVE',
        dep_build:     'BUILD ATUAL',
        dep_desc:      'O ficheiro de save existente é incompatível com esta versão do Vault 84. Carregar pode causar instabilidade ou corrupção de dados. É necessário um novo destacamento.',
        dep_btn:       'APAGAR SAVE E INICIAR NOVO DESTACAMENTO',
        dep_auth:      '// AUTORIZAÇÃO DO SUPERVISOR NECESSÁRIA PARA CONTINUAR',

        // Reactor Core
        rc_h1:              'NÚCLEO DO REACTOR',
        rc_op_status:       'ESTADO OPERACIONAL',
        rc_thermal:         'GESTÃO TÉRMICA',
        rc_cooling_desc:    'O arrefecimento é feito pela bomba de Tratamento de Água. Melhora a Água para aumentar a capacidade de arrefecimento.',
        rc_emergency_title: '!! VENTILAÇÃO DE EMERGÊNCIA',
        rc_vent_desc:       'Descarrega a potência do reactor para reduzir a temperatura ~400°C. O reactor fica offline 30s. Gratuito.',
        rc_vent_btn:        'VENTILAÇÃO DE EMERGÊNCIA',
        rc_shutdown:        'DESLIGAR',
        rc_start_reactor:   'INICIAR REACTOR',
        rc_thermal_map:     '// MAPA TÉRMICO DO NÚCLEO',
        rc_specs:           'ESPECIFICAÇÕES',

        // Mining Shaft
        ms_h1:          'POÇO DE MINERAÇÃO',
        ms_shaft_status:'ESTADO DO POÇO',
        ms_inventory:   'INVENTÁRIO',
        ms_manual:      'EXTRAÇÃO MANUAL',
        ms_manual_desc: 'Cada pressão rende minérios extra escalados pela saída do reactor e nível do poço.',
        ms_shutdown:    'DESLIGAR',
        ms_start:       'INICIAR MINERAÇÃO',
        ms_live_feed:   '// FEED AO VIVO DO POÇO',
        ms_telemetry:   'TELEMETRIA',

        // Ore Refinery
        or_h1:          'REFINARIA DE MINÉRIO',
        or_h2:          'UNIDADE DE PROCESSAMENTO TÉRMICO',
        or_flow:        'FLUXO',
        or_manual:      'PROCESSAMENTO MANUAL',
        or_manual_desc: 'Consome 5 minérios brutos instantaneamente para um aumento de saída refinada. Útil quando o auto-refine está lento.',
        or_eff_factors: 'FATORES DE EFICIÊNCIA',
        or_shutdown:    'DESLIGAR',
        or_start:       'INICIAR REFINARIA',
        or_specs:       'ESPECIFICAÇÕES',

        // Water Treatment
        wt_h1:          'TRATAMENTO DE ÁGUA',
        wt_h2:          'PLANTA DE CIRCULAÇÃO DE REFRIGERANTE',
        wt_pump:        'ESTADO DA BOMBA',
        wt_thermal_feed:'FEED TÉRMICO DO REACTOR',
        wt_pump_desc:   'A bomba mantém o reactor abaixo do limite crítico.',
        wt_shutdown:    'DESLIGAR BOMBA',
        wt_start:       'INICIAR BOMBA',
        wt_specs:       'ESPECIFICAÇÕES',

        // Smart Storage (SSM)
        ssm_h2:         'GESTÃO DE ARMAZENAMENTO',
        ssm_inventory:  'INVENTÁRIO',
        ssm_autosell:   'VENDA AUTOMÁTICA',
        ssm_sell_target:'ALVO DE VENDA',
        ssm_sell_all:   'VENDER TUDO',
        ssm_sell_raw:   'VENDER BRUTO',
        ssm_sell_refined:'VENDER REFINADO',
        ssm_market:     'MERCADO',

        // Workshop
        ws_h2:          'BAY DE MELHORIAS DO SISTEMA',
        ws_funds:       'FUNDOS DISPONÍVEIS',
        ws_power_budget:'ORÇAMENTO DE ENERGIA',
        ws_upgrade:     'MELHORAR',

        // Security
        sec_h2:         'SISTEMA DE DEFESA DO VAULT',
        sec_threats:    'ATIVIDADE DE AMEAÇAS',
        sec_maintenance:'MANUTENÇÃO',

        // Music
        mus_h2:         'SISTEMA DE ÁUDIO DO VAULT 84',
        mus_now_playing:'// A TOCAR',
        mus_tracklist:  '// LISTA DE MÚSICAS',
    }
};

export function getLang() {
    return localStorage.getItem(LANG_KEY) || 'EN';
}

export function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
}

export function t(key) {
    const lang = getLang();
    return (STRINGS[lang] || STRINGS.EN)[key] ?? STRINGS.EN[key] ?? key;
}
