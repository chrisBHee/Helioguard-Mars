'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { motion } from 'framer-motion';
import { Activity, Shield, Wifi, Zap } from 'lucide-react';
import { JarvisCore } from '@/services/jarvis-core';
import { NoaaSolarFluxService } from '@/services/noaa-solar-flux-service';
import { NasaDSNService } from '@/services/nasa-dsn-service';
import { NasaDonkiService } from '@/services/nasa-donki-service';
import '@xterm/xterm/css/xterm.css';

interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileSystemNode[];
}

export function HelioTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [systemStatus, setSystemStatus] = useState<'NOMINAL' | 'WARNING' | 'ALERT' | 'EMERGENCY'>('NOMINAL');
  const [threatLevel, setThreatLevel] = useState(0);

  // Mars-Specific Linux Filesystem Structure
  const fileSystem: FileSystemNode = {
    name: '/',
    type: 'directory',
    children: [
      {
        name: 'home',
        type: 'directory',
        children: [
          {
            name: 'mars-colonist',
            type: 'directory',
            children: [
              { 
                name: 'habitat-logs', 
                type: 'directory',
                children: [
                  { name: 'life-support-status.log', type: 'file', content: '2026-02-02 15:30:45 [OK] O2 Generation: 98% efficiency\n2026-02-02 15:30:45 [OK] CO2 Scrubbing: Active\n2026-02-02 15:30:45 [OK] Water Recycling: 95% recovery\n2026-02-02 15:30:45 [OK] Temperature: 22°C\n2026-02-02 15:30:45 [OK] Pressure: 101.3 kPa\n' },
                  { name: 'eva-operations.txt', type: 'file', content: 'EVA Operations Manual - Mars Base Alpha\n=====================================\n\nPre-EVA Checklist:\n□ Suit integrity check\n□ Oxygen levels verified\n□ Communication systems tested\n□ Tool inventory confirmed\n\nEmergency Procedures:\n□ Decompression protocol\n□ Dust storm shelter procedure\n□ Medical emergency response\n' },
                  { name: 'colony-status-report.md', type: 'file', content: '# Mars Colony Status Report\n\n## Habitat Systems\n- Life Support: NOMINAL\n- Power Generation: SOLAR + FUEL CELLS\n- Communications: DSN LINK ESTABLISHED\n\n## Environmental Conditions\n- External Temperature: -65°C\n- Atmospheric Pressure: 0.6 kPa\n- Solar Radiation: MODERATE\n\n## Crew Status\n- Population: 6\n- Health Status: ALL CLEAR\n- Mission Day: 47\n' }
                ]
              },
              { 
                name: 'research-data', 
                type: 'directory',
                children: [
                  { name: 'soil-analysis.csv', type: 'file', content: 'sample_id,location,composition,notes\nSAM-001,Hellas_Planitia,iron_oxide_rich,baseline_sample\nSAM-002,Olympus_Mons,sulfur_compounds,elevated_sulfur_levels\nSAM-003,Valles_Marineris,clay_minerals,potential_water_history\n' },
                  { name: 'atmospheric-readings.json', type: 'file', content: '{"timestamp": "2026-02-02T15:30:45Z", "co2_ppm": 9500, "o2_ppm": 120, "n2_ppm": 1900, "pressure_hpa": 6.1, "temperature_c": -65}' },
                  { name: 'geological-survey.txt', type: 'file', content: 'Mars Geological Survey - Quadrant 7\n=================================\n\nRock Samples Collected: 12\nMineral Composition:\n- Basalt: 65%\n- Olivine: 20%\n- Pyroxene: 15%\n\nWater Ice Indications: POSITIVE\nSubsurface Depth: ~1.2m\n\nRecommended Follow-up: Core drilling operation\n' }
                ]
              },
              { name: '.bashrc', type: 'file', content: '# Mars Colony Bash Configuration\n\n# Essential Aliases\nalias ll="ls -la --color=auto"\nalias la="ls -la --color=auto"\nalias ls="ls --color=auto"\nalias ..="cd .."\nalias ...="cd ../.."\n\n# Mars-specific commands\nalias habitat="~/bin/habitat-status"\nalias radiation="~/bin/radiation-monitor"\nalias comms="~/bin/comms-check"\nalias eva="~/bin/eva-prep"\n\n# Environment Variables\nexport MARS_BASE=/home/mars-colonist\nexport HABITAT_CONFIG=/etc/habitat/main.conf\nexport PATH=$PATH:$MARS_BASE/bin\n\n# Welcome Message\necho "Welcome to Mars Base Alpha Linux System"\necho "Mission Day: $(($(date +%s) / 86400 - 19400))"\n' },
              { name: '.vimrc', type: 'file', content: '" Mars Colonist Vim Configuration\nset number\nset relativenumber\nset tabstop=4\nset shiftwidth=4\nset expandtab\nset autoindent\n\ncolorscheme desert\n\n" Quick commands for Mars operations\nnoremap <leader>h :!~/bin/habitat-status<CR>\nnoremap <leader>r :!~/bin/radiation-monitor<CR>\n' },
              { name: 'todo.txt', type: 'file', content: 'Mars Colony Daily Tasks\n=====================\n\n[ ] Check life support systems\n[ ] Review DSN communication logs\n[ ] Analyze soil samples from yesterday\n[ ] Update habitat atmospheric readings\n[ ] Prepare EVA equipment for tomorrow\n[ ] Submit daily status report to Earth\n\nResearch Priorities:\n[ ] Investigate sulfur compound concentrations\n[ ] Map subsurface water ice deposits\n[ ] Monitor solar radiation patterns\n' }
            ]
          }
        ]
      },
      {
        name: 'opt',
        type: 'directory',
        children: [
          {
            name: 'helio-guard',
            type: 'directory',
            children: [
              { name: 'bin', type: 'directory', children: [
                { name: 'helio-status', type: 'file', content: '#!/bin/bash\necho "HELIO-GUARD Mars Defense System"\necho "==============================="\necho "Radiation Threat Level: $(curl -s http://localhost:3000/api/threat 2>/dev/null || echo "UNKNOWN")"\necho "Shielding Status: ACTIVE"\necho "Autonomous Mode: ENABLED"\n' },
                { name: 'alert-status', type: 'file', content: '#!/bin/bash\necho "MARS RADIATION ALERT SYSTEM"\necho "==========================="\n/usr/local/bin/noaa-flux-check\n' },
                { name: 'shield-check', type: 'file', content: '#!/bin/bash\necho "HABITAT SHIELDING SYSTEMS"\necho "======================="\necho "Primary Shielding: ACTIVE"\necho "Backup Shielding: STANDBY"\necho "EM Shielding: NOMINAL"\n' }
              ]},
              { name: 'config', type: 'directory', children: [
                { name: 'defense-protocols.json', type: 'file', content: '{"autonomous_response": true, "shield_activation_threshold": 100, "evacuation_protocol": "habitat_core", "communication_delay": 1240}' },
                { name: 'sensor-network.conf', type: 'file', content: '# HELIO-GUARD Sensor Network Configuration\n\n[sensors]\nradiation_detectors = 8\nmagnetic_field_sensors = 4\ntemperature_monitors = 12\n\n[network]\nprimary_server = 192.168.1.10\nbackup_server = 192.168.1.11\nmonitoring_port = 8080\n' }
              ]}
            ]
          }
        ]
      },
      {
        name: 'var',
        type: 'directory',
        children: [
          { name: 'log', type: 'directory', children: [
            { name: 'helio-guard', type: 'directory', children: [
              { name: 'radiation-monitor.log', type: 'file', content: 'Feb 02 15:30:45 helio-guard[1234]: PROTON_FLUX=28.7 pfu\nFeb 02 15:25:30 helio-guard[1234]: WARNING: Solar flare detected\nFeb 02 15:20:15 helio-guard[1234]: Shielding activated\nFeb 02 15:15:00 helio-guard[1234]: System nominal\n' },
              { name: 'system-health.log', type: 'file', content: 'Feb 02 15:30:45 health-check[5678]: All systems nominal\nFeb 02 15:25:30 health-check[5678]: CPU usage: 23%\nFeb 02 15:20:15 health-check[5678]: Memory usage: 6.2GB/16GB\nFeb 02 15:15:00 health-check[5678]: Disk space: 420GB free\n' }
            ]},
            { name: 'habitat', type: 'directory', children: [
              { name: 'life-support.log', type: 'file', content: 'Feb 02 15:30:45 life-support[9012]: O2 production stable\nFeb 02 15:30:45 life-support[9012]: CO2 scrubbers functioning\nFeb 02 15:30:45 life-support[9012]: Water recycling at 95%\nFeb 02 15:30:45 life-support[9012]: Temperature maintained at 22°C\n' }
            ]}
          ]}
        ]
      },
      {
        name: 'usr',
        type: 'directory',
        children: [
          { name: 'local', type: 'directory', children: [
            { name: 'bin', type: 'directory', children: [
              { name: 'noaa-flux-check', type: 'file', content: '#!/bin/bash\necho "Checking NOAA Space Weather..."\necho "Proton Flux: $(curl -s https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json | jq ".[0][1]" 2>/dev/null || echo "28.7") pfu"\n' },
              { name: 'dsn-link-monitor', type: 'file', content: '#!/bin/bash\necho "Monitoring DSN Links..."\necho "Active connections: 2/2"\necho "MAVEN: TRACKING (DSS-14)"\necho "MRO: TRACKING (DSS-43)"\n' },
              { name: 'habitat-status', type: 'file', content: '#!/bin/bash\necho "MARS HABITAT STATUS"\necho "=================="\necho "Life Support: NOMINAL"\necho "Power: SOLAR + FUEL CELLS"\necho "Communications: DSN ACTIVE"\necho "Population: 6 crew members"\n' }
            ]}
          ]}
        ]
      },
      {
        name: 'etc',
        type: 'directory',
        children: [
          { name: 'habitat', type: 'directory', children: [
            { name: 'main.conf', type: 'file', content: '# Mars Habitat Main Configuration\n\n[life_support]\noxygen_generation = true\nco2_scrubbing = true\nwater_recycling = 95%\ntemperature_target = 22\n\n[power]\nsolar_panels = 120kW\nfuel_cells = 40kW\nbattery_backup = 200kWh\n\n[communications]\ndsn_primary = DSS-14\ndsn_secondary = DSS-43\ninternal_network = 192.168.1.0/24\n' },
            { name: 'emergency-protocols.txt', type: 'file', content: 'MARS HABITAT EMERGENCY PROTOCOLS\n===============================\n\nRADIATION EVENT:\n1. Activate habitat shielding\n2. Move all personnel to core\n3. Monitor exposure levels\n4. Report to Earth via DSN\n\nSYSTEM FAILURE:\n1. Switch to backup systems\n2. Isolate affected components\n3. Initiate manual overrides\n4. Begin repair procedures\n\nMEDICAL EMERGENCY:\n1. Stabilize patient\n2. Contact Earth medical team\n3. Document treatment\n4. Update health logs\n' }
          ]},
          { name: 'systemd', type: 'directory', children: [
            { name: 'system', type: 'directory', children: [
              { name: 'helio-guard.service', type: 'file', content: '[Unit]\nDescription=HELIO-GUARD Mars Defense System\nAfter=network.target\n\n[Service]\nType=simple\nUser=mars-colonist\nExecStart=/opt/helio-guard/bin/helio-guard-daemon\nRestart=always\n\n[Install]\nWantedBy=multi-user.target\n' },
              { name: 'life-support.service', type: 'file', content: '[Unit]\nDescription=Mars Habitat Life Support\nAfter=local-fs.target\n\n[Service]\nType=simple\nExecStart=/usr/local/bin/life-support-controller\nRestart=always\n\n[Install]\nWantedBy=multi-user.target\n' }
            ]}
          ]}
        ]
      },
      {
        name: 'proc',
        type: 'directory',
        children: [
          { name: 'helio-guard', type: 'file', content: 'HELIO-GUARD Process Information\nPID: 1234\nStatus: RUNNING\nCPU: 2.3%\nMemory: 128MB\nStarted: 2026-02-02 08:00:00\n' },
          { name: 'life-support', type: 'file', content: 'Life Support Process\nPID: 5678\nStatus: RUNNING\nCPU: 1.8%\nMemory: 96MB\nO2 Production: 98%\nCO2 Scrubbing: ACTIVE\n' }
        ]
      }
    ]
  };

  useEffect(() => {
    if (!terminalRef.current || isInitialized) return;

    // Initialize XTerm.js
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#000000',
        foreground: '#FF8C00',
        cursor: '#FF8C00',
        black: '#000000',
        red: '#DC143C',
        green: '#32CD32',
        yellow: '#FFD700',
        blue: '#1E90FF',
        magenta: '#FF69B4',
        cyan: '#00CED1',
        white: '#F5F5F5',
        brightBlack: '#696969',
        brightRed: '#FF4500',
        brightGreen: '#00FA9A',
        brightYellow: '#FFA500',
        brightBlue: '#4169E1',
        brightMagenta: '#FF1493',
        brightCyan: '#20B2AA',
        brightWhite: '#FFFFFF'
      },
      fontFamily: 'monospace',
      fontSize: 14,
      rows: 20,
      cols: 80
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Attach to DOM
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    setIsInitialized(true);

    // Display welcome message
    term.writeln('\x1b[1;33mHELIOGUARD TERMINAL v1.0\x1b[0m');
    term.writeln('\x1b[36mNASA Autonomous Mars Defense Console\x1b[0m');
    term.writeln('\x1b[32mConnected to JARVIS-V1 AI Core\x1b[0m');
    term.writeln('\x1b[36mType \x1b[1;37mhelp\x1b[0;36m for available commands\x1b[0m');
    term.writeln('');
    term.write('\x1b[1;32mmars-colonist@helio-guard:~$ \x1b[0m');

    // Set up command handler
    term.onData((data) => {
      handleTerminalInput(data, term);
    });

    // Update system status periodically
    const statusInterval = setInterval(() => {
      const jarvis = JarvisCore.getInstance();
      const state = jarvis.getState();
      setSystemStatus(state.systemStatus);
      setThreatLevel(state.threatLevel);
    }, 2000);

    return () => {
      clearInterval(statusInterval);
      term.dispose();
    };
  }, [isInitialized]);

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentDirectory = (path: string): FileSystemNode | null => {
    const parts = path.split('/').filter(p => p);
    let current: FileSystemNode | undefined = fileSystem;
    
    for (const part of parts) {
      if (current?.children) {
        current = current.children.find(node => node.name === part);
        if (!current) return null;
      }
    }
    
    return current || fileSystem;
  };

  const executeCommand = async (command: string, args: string[], term: Terminal): Promise<void> => {
    const cmd = command.trim();
    
    switch (cmd) {
      case 'ls':
        await handleLs(args, term);
        break;
      case 'cd':
        await handleCd(args, term);
        break;
      case 'cat':
        await handleCat(args, term);
        break;
      case 'pwd':
        term.writeln(currentPath);
        break;
      case 'whoami':
        term.writeln('mars-colonist');
        break;
      case 'date':
        term.writeln(new Date().toString());
        break;
      case 'uptime':
        const uptime = process.uptime ? process.uptime() : Math.floor((Date.now() - new Date('2026-01-01').getTime()) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        term.writeln(`System uptime: ${hours} hours, ${minutes} minutes`);
        break;
      case 'ps':
        term.writeln('\x1b[1;36mPID\x1b[0m  \x1b[1;36mTTY\x1b[0m  \x1b[1;36mTIME\x1b[0m  \x1b[1;36mCMD\x1b[0m');
        term.writeln('  1  pts/0  00:00:01  jvm-jarvis-core');
        term.writeln('  2  pts/0  00:00:02  python-dsn-agent');
        term.writeln('  3  pts/0  00:00:01  node-helio-guard');
        break;
      case 'df':
        term.writeln('\x1b[1;36mFilesystem\x1b[0m  \x1b[1;36mSize\x1b[0m  \x1b[1;36mUsed\x1b[0m  \x1b[1;36mAvail\x1b[0m  \x1b[1;36mUse%\x1b[0m  \x1b[1;36mMounted on\x1b[0m');
        term.writeln('/dev/sda1    100G   25G    75G   25%   /');
        term.writeln('/dev/sdb1    500G  120G   380G   24%   /data');
        break;
      case 'free':
        term.writeln('              \x1b[1;36mtotal\x1b[0m       \x1b[1;36mused\x1b[0m       \x1b[1;36mfree\x1b[0m     \x1b[1;36mshared\x1b[0m');
        term.writeln('\x1b[1;36mMem:\x1b[0m      16384MB    8192MB    8192MB      512MB');
        term.writeln('\x1b[1;36mSwap:\x1b[0m      2048MB     256MB    1792MB');
        break;
      case 'clear':
        term.clear();
        break;
      case 'alert-status':
        await handleAlertStatus(term);
        break;
      case 'helio-status':
        await handleHelioStatus(term);
        break;
      case 'shield-check':
        await handleShieldCheck(term);
        break;
      case 'dsn-status':
        await handleDsnStatus(term);
        break;
      case 'habitat':
        await handleHabitatStatus(term);
        break;
      case 'eva':
        await handleEvaPrep(term);
        break;
      case 'comms':
        await handleCommsCheck(term);
        break;
      case 'netstat':
        await handleNetStat(term);
        break;
      case 'ping':
        await handlePing(args, term);
        break;
      case 'traceroute':
        await handleTraceroute(args, term);
        break;
      case 'ifconfig':
        await handleIfconfig(term);
        break;
      case 'top':
        await handleTop(term);
        break;
      case 'system-check':
        await handleSystemCheck(term);
        break;
      case 'help':
        term.writeln('\x1b[1;32m=== MARS COLONY LINUX TERMINAL ===\x1b[0m');
        term.writeln('\x1b[36mMars Base Alpha - Mission Day 47\x1b[0m');
        term.writeln('');
        term.writeln('\x1b[1;36mESSENTIAL COMMANDS:\x1b[0m');
        term.writeln('  \x1b[37mls [directory]\x1b[0m     - List directory contents');
        term.writeln('  \x1b[37mcd <directory>\x1b[0m     - Change directory');
        term.writeln('  \x1b[37mcat <file>\x1b[0m         - Display file contents');
        term.writeln('  \x1b[37mpwd\x1b[0m                - Print working directory');
        term.writeln('  \x1b[37mwhoami\x1b[0m             - Display current user');
        term.writeln('  \x1b[37mdate\x1b[0m               - Show current date/time');
        term.writeln('  \x1b[37mclear\x1b[0m              - Clear terminal screen');
        term.writeln('');
        term.writeln('\x1b[1;36mMARS HABITAT COMMANDS:\x1b[0m');
        term.writeln('  \x1b[37mhabitat\x1b[0m            - Check habitat life support systems');
        term.writeln('  \x1b[37meva\x1b[0m                 - EVA preparation checklist');
        term.writeln('  \x1b[37mcomms\x1b[0m              - Communication systems status');
        term.writeln('  \x1b[37mdsn-status\x1b[0m         - Deep Space Network links');
        term.writeln('');
        term.writeln('\x1b[1;36mHELIO-GUARD DEFENSE:\x1b[0m');
        term.writeln('  \x1b[37malert-status\x1b[0m       - Radiation alert system');
        term.writeln('  \x1b[37mhelio-status\x1b[0m       - Defense system status');
        term.writeln('  \x1b[37mshield-check\x1b[0m       - Shielding systems');
        term.writeln('  \x1b[37msystem-check\x1b[0m       - Full system diagnostics');
        term.writeln('');
        term.writeln('\x1b[1;36mNETWORK MONITORING:\x1b[0m');
        term.writeln('  \x1b[37mnetstat\x1b[0m            - Active network connections');
        term.writeln('  \x1b[37mping <host>\x1b[0m        - Test network connectivity');
        term.writeln('  \x1b[37mtraceroute <host>\x1b[0m  - Trace network path');
        term.writeln('  \x1b[37mifconfig\x1b[0m           - Network interface configuration');
        term.writeln('  \x1b[37mtop\x1b[0m                - Real-time system monitor');
        term.writeln('');
        term.writeln('\x1b[1;36mSYSTEM INFORMATION:\x1b[0m');
        term.writeln('  \x1b[37muptime\x1b[0m             - System uptime');
        term.writeln('  \x1b[37mps\x1b[0m                 - Process status');
        term.writeln('  \x1b[37mdf\x1b[0m                 - Disk space usage');
        term.writeln('  \x1b[37mfree\x1b[0m               - Memory usage');
        term.writeln('  \x1b[37mhelp\x1b[0m               - Show this help menu');
        term.writeln('  \x1b[37mexit\x1b[0m               - Exit terminal session');
        term.writeln('');
        term.writeln('\x1b[1;32mCurrent Location:\x1b[0m \x1b[37m' + currentPath + '\x1b[0m');
        break;
      case 'exit':
        term.writeln('\x1b[31mSession terminated\x1b[0m');
        term.writeln('Connection closed.');
        break;
      default:
        term.writeln(`\x1b[31mCommand not found: ${cmd}\x1b[0m`);
        term.writeln('Type "help" for available commands.');
    }
  };

  const handleLs = async (args: string[], term: Terminal): Promise<void> => {
    const path = args[0] || currentPath;
    const dir = getCurrentDirectory(path);
    
    if (!dir || dir.type !== 'directory' || !dir.children) {
      term.writeln(`\x1b[31mls: cannot access '${path}': No such directory\x1b[0m`);
      return;
    }

    dir.children.forEach(node => {
      const color = node.type === 'directory' ? '\x1b[1;34m' : '\x1b[37m';
      term.writeln(`${color}${node.name}\x1b[0m`);
    });
  };

  const handleCd = async (args: string[], term: Terminal): Promise<void> => {
    if (args.length === 0) {
      setCurrentPath('/');
      return;
    }

    const newPath = args[0];
    let targetPath = newPath;
    
    // Handle relative paths
    if (!newPath.startsWith('/')) {
      targetPath = currentPath === '/' ? `/${newPath}` : `${currentPath}/${newPath}`;
    }
    
    const dir = getCurrentDirectory(targetPath);
    
    if (!dir || dir.type !== 'directory') {
      term.writeln(`\x1b[31mcd: no such directory: ${newPath}\x1b[0m`);
      return;
    }
    
    setCurrentPath(targetPath);
  };

  const handleCat = async (args: string[], term: Terminal): Promise<void> => {
    if (args.length === 0) {
      term.writeln('\x1b[31mcat: missing file operand\x1b[0m');
      return;
    }

    const filePath = args[0];
    let fullPath = filePath;
    
    if (!filePath.startsWith('/')) {
      fullPath = currentPath === '/' ? `/${filePath}` : `${currentPath}/${filePath}`;
    }
    
    const parts = fullPath.split('/').filter(p => p);
    let current: FileSystemNode | undefined = fileSystem;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (current?.children) {
        current = current.children.find(node => node.name === part);
        if (!current) {
          term.writeln(`\x1b[31mcat: ${filePath}: No such file or directory\x1b[0m`);
          return;
        }
      }
    }
    
    if (current?.type === 'file') {
      term.writeln(current.content || '');
    } else {
      term.writeln(`\x1b[31mcat: ${filePath}: Is a directory\x1b[0m`);
    }
  };

  const handleAlertStatus = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;33m=== HELIOGUARD RADIATION ALERT STATUS ===\x1b[0m');
    
    try {
      // Get current solar flux data
      const fluxData = await NoaaSolarFluxService.getLatestProtonFlux();
      const riskAssessment = NoaaSolarFluxService.getFluxRiskAssessment(fluxData.protonFlux);
      
      term.writeln(`\x1b[1;36mCurrent Proton Flux:\x1b[0m ${fluxData.protonFlux.toFixed(2)} pfu`);
      term.writeln(`\x1b[1;36mEnergy Band:\x1b[0m ${fluxData.energy}`);
      term.writeln(`\x1b[1;36mSatellite:\x1b[0m ${fluxData.satellite}`);
      term.writeln(`\x1b[1;36mRisk Level:\x1b[0m ${riskAssessment.riskLevel}`);
      term.writeln(`\x1b[1;36mDescription:\x1b[0m ${riskAssessment.description}`);
      
      // Get DSN status
      const dsnStatus = await NasaDSNService.getDSNStatus();
      term.writeln(`\x1b[1;36mDSN Active Links:\x1b[0m ${dsnStatus.activeConnections}/${dsnStatus.marsAssets.length}`);
      
      // Get recent solar flares
      const flares = await NasaDonkiService.getRecentSolarFlares(1);
      if (flares.length > 0) {
        const latestFlare = flares[0];
        term.writeln(`\x1b[1;36mLatest Solar Flare:\x1b[0m ${latestFlare.classType}${latestFlare.magnitude}`);
      }
      
      // Get JARVIS status
      const jarvis = JarvisCore.getInstance();
      const jarvisState = jarvis.getState();
      term.writeln(`\x1b[1;36mJARVIS Threat Level:\x1b[0m ${jarvisState.threatLevel}%`);
      term.writeln(`\x1b[1;36mSystem Status:\x1b[0m ${jarvisState.systemStatus}`);
      
    } catch (error) {
      term.writeln('\x1b[31mError retrieving alert status data\x1b[0m');
    }
  };

  const handleSystemCheck = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;33m=== HELIOGUARD SYSTEM DIAGNOSTICS ===\x1b[0m');
    
    try {
      // Check API connectivity
      term.write('\x1b[36mChecking NOAA Solar Flux API... \x1b[0m');
      const fluxData = await NoaaSolarFluxService.getLatestProtonFlux();
      term.writeln('\x1b[32m✓ CONNECTED\x1b[0m');
      
      term.write('\x1b[36mChecking NASA DSN Network... \x1b[0m');
      const dsnStatus = await NasaDSNService.getDSNStatus();
      term.writeln(`\x1b[32m✓ ${dsnStatus.activeConnections} ACTIVE LINKS\x1b[0m`);
      
      term.write('\x1b[36mChecking NASA DONKI Services... \x1b[0m');
      const flares = await NasaDonkiService.getRecentSolarFlares(1);
      term.writeln('\x1b[32m✓ CONNECTED\x1b[0m');
      
      // JARVIS status
      const jarvis = JarvisCore.getInstance();
      const jarvisState = jarvis.getState();
      term.writeln(`\x1b[1;36mJARVIS Core:\x1b[0m \x1b[32mACTIVE\x1b[0m`);
      term.writeln(`\x1b[1;36mThreat Assessment:\x1b[0m ${jarvisState.threatLevel}%`);
      term.writeln(`\x1b[1;36mAutonomous Mode:\x1b[0m ${jarvisState.autonomousMode ? '\x1b[32mENABLED\x1b[0m' : '\x1b[31mDISABLED\x1b[0m'}`);
      
      term.writeln('');
      term.writeln('\x1b[1;32mAll systems nominal. Ready for mission operations.\x1b[0m');
      
    } catch (error) {
      term.writeln('\x1b[31m✗ SYSTEM CHECK FAILED\x1b[0m');
      term.writeln(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
    }
  };

  const handleHelioStatus = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;33m=== HELIOGUARD OVERALL STATUS ===\x1b[0m');
    
    try {
      // Get comprehensive system status
      const jarvis = JarvisCore.getInstance();
      const jarvisState = jarvis.getState();
      const fluxData = await NoaaSolarFluxService.getLatestProtonFlux();
      const dsnStatus = await NasaDSNService.getDSNStatus();
      
      term.writeln(`\x1b[1;36mMission Phase:\x1b[0m MARS_SURFACE_OPERATIONS`);
      term.writeln(`\x1b[1;36mSystem Status:\x1b[0m ${jarvisState.systemStatus}`);
      term.writeln(`\x1b[1;36mThreat Level:\x1b[0m ${jarvisState.threatLevel}%`);
      term.writeln(`\x1b[1;36mRadiation Flux:\x1b[0m ${fluxData.protonFlux.toFixed(2)} pfu`);
      term.writeln(`\x1b[1;36mDSN Links:\x1b[0m ${dsnStatus.activeConnections}/${dsnStatus.marsAssets.length} active`);
      term.writeln(`\x1b[1;36mShielding:\x1b[0m ${jarvisState.shieldingStatus}`);
      term.writeln(`\x1b[1;36mAutonomous Mode:\x1b[0m ${jarvisState.autonomousMode ? '\x1b[32mACTIVE\x1b[0m' : '\x1b[33mSTANDBY\x1b[0m'}`);
      
      // Add status indicator
      const statusColor = jarvisState.threatLevel < 30 ? '\x1b[32m' : 
                         jarvisState.threatLevel < 60 ? '\x1b[33m' : '\x1b[31m';
      term.writeln('');
      term.writeln(`${statusColor}MISSION STATUS: ${jarvisState.systemStatus}\x1b[0m`);
      
    } catch (error) {
      term.writeln('\x1b[31mError retrieving system status\x1b[0m');
    }
  };

  const handleShieldCheck = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;33m=== SHIELDING SYSTEM STATUS ===\x1b[0m');
    
    try {
      const jarvis = JarvisCore.getInstance();
      const jarvisState = jarvis.getState();
      const fluxData = await NoaaSolarFluxService.getLatestProtonFlux();
      
      // Shielding assessment
      const riskAssessment = NoaaSolarFluxService.getFluxRiskAssessment(fluxData.protonFlux);
      
      term.writeln(`\x1b[1;36mCurrent Shielding Status:\x1b[0m ${jarvisState.shieldingStatus}`);
      term.writeln(`\x1b[1;36mRadiation Level:\x1b[0m ${fluxData.protonFlux.toFixed(2)} pfu`);
      term.writeln(`\x1b[1;36mRisk Assessment:\x1b[0m ${riskAssessment.riskLevel}`);
      
      // Shield effectiveness calculation
      let shieldEffectiveness = 100;
      if (fluxData.protonFlux > 1000) shieldEffectiveness = 40;
      else if (fluxData.protonFlux > 100) shieldEffectiveness = 65;
      else if (fluxData.protonFlux > 10) shieldEffectiveness = 85;
      
      term.writeln(`\x1b[1;36mShield Effectiveness:\x1b[0m ${shieldEffectiveness}%`);
      
      // Recommendations
      term.writeln('');
      term.writeln('\x1b[1;36mRECOMMENDATIONS:\x1b[0m');
      riskAssessment.recommendations.forEach(rec => {
        term.writeln(`  • ${rec}`);
      });
      
      // Status indicator
      const shieldColor = shieldEffectiveness > 80 ? '\x1b[32m' : 
                         shieldEffectiveness > 60 ? '\x1b[33m' : '\x1b[31m';
      term.writeln('');
      term.writeln(`${shieldColor}SHIELD STATUS: ${shieldEffectiveness > 60 ? 'ADEQUATE' : 'COMPROMISED'}\x1b[0m`);
      
    } catch (error) {
      term.writeln('\x1b[31mError checking shielding systems\x1b[0m');
    }
  };

  const handleDsnStatus = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;33m=== DSN NETWORK STATUS ===\x1b[0m');
    
    try {
      const dsnStatus = await NasaDSNService.getDSNStatus();
      
      term.writeln(`\x1b[1;36mActive Links:\x1b[0m ${dsnStatus.activeConnections}/${dsnStatus.marsAssets.length}`);
      term.writeln(`\x1b[1;36mTimestamp:\x1b[0m ${dsnStatus.timestamp.toLocaleString()}`);
      term.writeln('');
      
      if (dsnStatus.marsAssets.length > 0) {
        term.writeln('\x1b[1;36mSPACECRAFT STATUS:\x1b[0m');
        dsnStatus.marsAssets.forEach(asset => {
          const statusColor = NasaDSNService.getStatusColor(asset.status);
          term.writeln(`\x1b[1m${asset.name}:\x1b[0m`);
          term.writeln(`  Status: ${statusColor}${asset.status.replace('_', ' ')}\x1b[0m`);
          term.writeln(`  Antenna: ${asset.antenna}`);
          term.writeln(`  Signal Strength: ${asset.signalStrength} dB`);
          term.writeln(`  Data Rate: ${asset.dataRate} kbps`);
          term.writeln(`  Last Contact: ${asset.lastContact.toLocaleString()}`);
          term.writeln('');
        });
      } else {
        term.writeln('\x1b[33mNo active Mars communication links\x1b[0m');
        term.writeln('Expected spacecraft: MAVEN, MRO');
      }
      
      // Show antenna status
      if (dsnStatus.antennas.length > 0) {
        term.writeln('\x1b[1;36mANTENNA STATUS:\x1b[0m');
        dsnStatus.antennas.forEach(antenna => {
          const statusColor = antenna.status === 'ACTIVE' ? '\x1b[32m' : 
                             antenna.status === 'STANDBY' ? '\x1b[33m' : '\x1b[31m';
          term.writeln(`${statusColor}${antenna.name}: ${antenna.status}\x1b[0m (${antenna.site})`);
        });
      }
      
    } catch (error) {
      term.writeln('\x1b[31mError retrieving DSN status\x1b[0m');
    }
  };

  const handleHabitatStatus = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;32m=== MARS HABITAT STATUS ===\x1b[0m');
    
    try {
      // Simulate habitat systems check
      const systems = [
        { name: 'Life Support', status: 'NOMINAL', value: 'O2: 21%, CO2: <1000ppm' },
        { name: 'Power Generation', status: 'NOMINAL', value: 'Solar: 120kW, Fuel Cells: 40kW' },
        { name: 'Water Recycling', status: 'NOMINAL', value: '95% recovery efficiency' },
        { name: 'Temperature Control', status: 'NOMINAL', value: '22°C ± 1°C' },
        { name: 'Atmospheric Pressure', status: 'NOMINAL', value: '101.3 kPa' }
      ];
      
      systems.forEach(sys => {
        const statusColor = sys.status === 'NOMINAL' ? '\x1b[32m' : '\x1b[31m';
        term.writeln(`${statusColor}● ${sys.name}: ${sys.status}\x1b[0m`);
        term.writeln(`  ${sys.value}`);
      });
      
      term.writeln('');
      term.writeln('\x1b[1;32mAll habitat systems operational\x1b[0m');
      
    } catch (error) {
      term.writeln('\x1b[31mError checking habitat status\x1b[0m');
    }
  };

  const handleEvaPrep = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;33m=== EVA PREPARATION CHECKLIST ===\x1b[0m');
    
    const checklist = [
      'Suit integrity test: PASSED',
      'Oxygen levels: 100%',
      'Communication systems: ONLINE',
      'Tool inventory: COMPLETE',
      'Emergency protocols: READY',
      'Weather conditions: CLEAR',
      'Radiation levels: ACCEPTABLE'
    ];
    
    checklist.forEach(item => {
      term.writeln(`\x1b[32m✓ ${item}\x1b[0m`);
    });
    
    term.writeln('');
    term.writeln('\x1b[1;33mEVA GO FOR MISSION\x1b[0m');
    term.writeln('Estimated duration: 4 hours');
  };

  const handleCommsCheck = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;36m=== COMMUNICATIONS STATUS ===\x1b[0m');
    
    try {
      const dsnStatus = await NasaDSNService.getDSNStatus();
      
      term.writeln('\x1b[1;36mDSN Network:\x1b[0m');
      term.writeln(`  Active Links: ${dsnStatus.activeConnections}/${dsnStatus.marsAssets.length}`);
      
      dsnStatus.marsAssets.forEach(asset => {
        const statusColor = NasaDSNService.getStatusColor(asset.status);
        term.writeln(`  ${asset.name}: ${statusColor}${asset.status.replace('_', ' ')}\x1b[0m (${asset.antenna})`);
      });
      
      term.writeln('');
      term.writeln('\x1b[1;36mInternal Network:\x1b[0m');
      term.writeln('  Habitat LAN: 192.168.1.0/24 - OPERATIONAL');
      term.writeln('  Wireless Mesh: 5GHz - NOMINAL');
      term.writeln('  Data Rate: 1.2 Gbps');
      
      term.writeln('');
      term.writeln('\x1b[1;32mAll communication systems active\x1b[0m');
      
    } catch (error) {
      term.writeln('\x1b[31mError checking communications\x1b[0m');
    }
  };

  const handleNetStat = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;36m=== NETWORK CONNECTIONS ===\x1b[0m');
    
    const connections = [
      { proto: 'tcp', recv: '192.168.1.10:8080', send: 'earth.nasa.gov:443', state: 'ESTABLISHED' },
      { proto: 'tcp', recv: '192.168.1.10:22', send: 'rover-01.local:22', state: 'ESTABLISHED' },
      { proto: 'udp', recv: '192.168.1.10:53', send: '8.8.8.8:53', state: 'CONNECTED' },
      { proto: 'tcp', recv: '192.168.1.10:3000', send: 'localhost:3000', state: 'LISTEN' }
    ];
    
    term.writeln('\x1b[1;37mProto Recv-Q Send-Q Local Address           Foreign Address         State\x1b[0m');
    connections.forEach(conn => {
      const stateColor = conn.state === 'ESTABLISHED' ? '\x1b[32m' : 
                        conn.state === 'LISTEN' ? '\x1b[33m' : '\x1b[36m';
      term.writeln(`${conn.proto.padEnd(6)} 0      0      ${conn.recv.padEnd(22)} ${conn.send.padEnd(23)} ${stateColor}${conn.state}\x1b[0m`);
    });
    
    term.writeln('');
    term.writeln('\x1b[1;32m4 active connections\x1b[0m');
  };

  const handlePing = async (args: string[], term: Terminal): Promise<void> => {
    if (args.length === 0) {
      term.writeln('\x1b[31mUsage: ping <hostname>\x1b[0m');
      return;
    }
    
    const host = args[0];
    term.writeln(`PING ${host} (192.168.1.1): 56 data bytes`);
    
    // Simulate ping responses
    for (let i = 1; i <= 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const latency = 120 + Math.random() * 80; // 120-200ms
      term.writeln(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${latency.toFixed(1)} ms`);
    }
    
    term.writeln('');
    term.writeln('--- ping statistics ---');
    term.writeln('4 packets transmitted, 4 received, 0% packet loss');
  };

  const handleTraceroute = async (args: string[], term: Terminal): Promise<void> => {
    if (args.length === 0) {
      term.writeln('\x1b[31mUsage: traceroute <hostname>\x1b[0m');
      return;
    }
    
    const host = args[0];
    term.writeln(`traceroute to ${host} (192.168.1.1), 30 hops max, 60 byte packets`);
    
    const hops = [
      '192.168.1.1 (habitat-router) 1.2 ms 1.1 ms 1.3 ms',
      '192.168.10.1 (colony-switch) 2.4 ms 2.1 ms 2.6 ms',
      '10.0.0.1 (earth-relay) 1240.5 ms 1241.2 ms 1239.8 ms',
      '192.168.1.1 (earth-control) 1242.1 ms 1241.8 ms 1242.3 ms'
    ];
    
    hops.forEach((hop, index) => {
      term.writeln(`${(index + 1).toString().padEnd(2)} ${hop}`);
    });
  };

  const handleIfconfig = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;36meth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\x1b[0m');
    term.writeln('        inet 192.168.1.10  netmask 255.255.255.0  broadcast 192.168.1.255');
    term.writeln('        inet6 fe80::a00:27ff:fe9d:6a2b  prefixlen 64  scopeid 0x20<link>');
    term.writeln('        ether 08:00:27:9d:6a:2b  txqueuelen 1000  (Ethernet)');
    term.writeln('        RX packets 12485  bytes 1845672 (1.8 MB)');
    term.writeln('        TX packets 9876  bytes 1567890 (1.5 MB)');
    term.writeln('');
    term.writeln('\x1b[1;36mlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\x1b[0m');
    term.writeln('        inet 127.0.0.1  netmask 255.0.0.0');
    term.writeln('        inet6 ::1  prefixlen 128  scopeid 0x10<host>');
    term.writeln('        loop  txqueuelen 1000  (Local Loopback)');
    term.writeln('        RX packets 4567  bytes 345678 (345.6 KB)');
    term.writeln('        TX packets 4567  bytes 345678 (345.6 KB)');
  };

  const handleTop = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;36mtop - 15:30:45 up 47 days,  7:30,  1 user,  load average: 0.23, 0.18, 0.15\x1b[0m');
    term.writeln('Tasks: 124 total,   1 running, 123 sleeping,   0 stopped,   0 zombie');
    term.writeln('%Cpu(s): 15.2 us,  2.1 sy,  0.0 ni, 82.3 id,  0.2 wa,  0.0 hi,  0.2 si,  0.0 st');
    term.writeln('MiB Mem :  16384.0 total,   8192.0 free,   6144.0 used,   2048.0 buff/cache');
    term.writeln('MiB Swap:   2048.0 total,   1792.0 free,    256.0 used.  10240.0 avail Mem');
    term.writeln('');
    term.writeln('\x1b[1;37m  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\x1b[0m');
    term.writeln(' 1234 mars-col+ 20   0  128456  56784  12344 S  2.3   0.3   1245:23 helio-guard');
    term.writeln(' 5678 root      20   0   65432  23456   8765 S  1.8   0.1    456:78 life-support');
    term.writeln(' 9012 mars-col+ 20   0   45678  12345   4567 S  0.5   0.1    123:45 dsn-monitor');
    term.writeln(' 3456 mars-col+ 20   0   23456   8765   2345 S  0.2   0.1     67:89 bash');
  };

  // Track command input buffer and cursor position
  const inputBufferRef = useRef('');
  const cursorPositionRef = useRef(0);
  
  const handleTerminalInput = async (data: string, term: Terminal): Promise<void> => {
    // Handle special key sequences
    if (data === '\r') { // Enter key
      term.writeln('');
      
      // Execute the buffered command
      if (inputBufferRef.current.trim()) {
        const [command, ...args] = inputBufferRef.current.trim().split(' ');
        await executeCommand(command, args, term);
      }
      
      // Reset input buffer and show new prompt
      inputBufferRef.current = '';
      cursorPositionRef.current = 0;
      const pathDisplay = currentPath === '/' ? '~' : currentPath;
      term.write(`\x1b[1;32mmars-colonist@helio-guard:${pathDisplay}$ \x1b[0m`);
      
    } else if (data === '\u007f' || data === '\b') { // Backspace
      // Handle backspace - remove character at cursor position
      if (cursorPositionRef.current > 0 && inputBufferRef.current.length > 0) {
        const cursorX = (term as any).buffer.active.cursorX;
        if (cursorX > 25) { // Past the prompt
          // Remove character from buffer
          const beforeCursor = inputBufferRef.current.slice(0, cursorPositionRef.current - 1);
          const afterCursor = inputBufferRef.current.slice(cursorPositionRef.current);
          inputBufferRef.current = beforeCursor + afterCursor;
          cursorPositionRef.current--;
          
          // Redraw the line
          term.write('\b'); // Move cursor back
          term.write(inputBufferRef.current.slice(cursorPositionRef.current) + ' ');
          // Move cursor back to correct position
          for (let i = 0; i < inputBufferRef.current.length - cursorPositionRef.current; i++) {
            term.write('\x1b[D'); // Cursor left
          }
        }
      }
      
    } else if (data === '\x1b[D') { // Left arrow
      if (cursorPositionRef.current > 0) {
        cursorPositionRef.current--;
        term.write('\x1b[D'); // Move cursor left
      }
      
    } else if (data === '\x1b[C') { // Right arrow
      if (cursorPositionRef.current < inputBufferRef.current.length) {
        cursorPositionRef.current++;
        term.write('\x1b[C'); // Move cursor right
      }
      
    } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) { // Printable characters
      // Insert character at cursor position
      const beforeCursor = inputBufferRef.current.slice(0, cursorPositionRef.current);
      const afterCursor = inputBufferRef.current.slice(cursorPositionRef.current);
      inputBufferRef.current = beforeCursor + data + afterCursor;
      cursorPositionRef.current++;
      
      // Display the character and redraw the rest of the line
      term.write(data);
      if (afterCursor) {
        term.write(afterCursor);
        // Move cursor back to correct position
        for (let i = 0; i < afterCursor.length; i++) {
          term.write('\x1b[D'); // Cursor left
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black rounded-xl border-2 border-orange-500 overflow-hidden shadow-2xl"
    >
      {/* Terminal Header */}
      <div className="bg-orange-900/30 px-4 py-3 flex items-center justify-between border-b border-orange-500/50">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-400" />
          <h3 className="font-mono text-orange-400 font-bold">HELIOGUARD TERMINAL</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-orange-300">ACTIVE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-orange-400" />
            <span className={
              systemStatus === 'EMERGENCY' ? 'text-red-400' :
              systemStatus === 'ALERT' ? 'text-orange-400' :
              systemStatus === 'WARNING' ? 'text-yellow-400' : 'text-green-400'
            }>
              STATUS: {systemStatus}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-orange-400" />
            <span className="text-orange-300">THREAT: {threatLevel}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-400" />
            <span className="text-orange-300">PATH: {currentPath}</span>
          </div>
        </div>
      </div>

      {/* XTerm.js Terminal Container */}
      <div className="p-2">
        <div 
          ref={terminalRef}
          className="w-full h-96 bg-black rounded-lg overflow-hidden"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-2 bg-gray-900/50 border-t border-orange-500/30 text-xs text-orange-300">
        <div className="flex justify-between">
          <span>JARVIS-V1 AI Core: CONNECTED</span>
          <span>Type 'help' for commands</span>
        </div>
      </div>
    </motion.div>
  );
}