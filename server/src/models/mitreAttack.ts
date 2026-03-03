import { MitreMapping } from '../types';

export const MITRE_MAPPINGS: MitreMapping[] = [
  {
    tacticId: 'TA0001',
    tacticName: 'Initial Access',
    techniqueId: 'T1190',
    techniqueName: 'Exploit Public-Facing Application',
    description: 'Attackers exploit internet-facing services to gain initial foothold.',
  },
  {
    tacticId: 'TA0002',
    tacticName: 'Execution',
    techniqueId: 'T1059',
    techniqueName: 'Command and Scripting Interpreter',
    description: 'Adversary executes scripts or shell commands to run malicious actions.',
  },
  {
    tacticId: 'TA0003',
    tacticName: 'Persistence',
    techniqueId: 'T1547',
    techniqueName: 'Boot or Logon Autostart Execution',
    description: 'Malware establishes startup persistence to survive reboots.',
  },
  {
    tacticId: 'TA0004',
    tacticName: 'Privilege Escalation',
    techniqueId: 'T1068',
    techniqueName: 'Exploitation for Privilege Escalation',
    description: 'Threat actor leverages vulnerable software to gain elevated privileges.',
  },
  {
    tacticId: 'TA0005',
    tacticName: 'Defense Evasion',
    techniqueId: 'T1027',
    techniqueName: 'Obfuscated Files or Information',
    description: 'Packed or obfuscated files are used to evade static detection.',
  },
  {
    tacticId: 'TA0006',
    tacticName: 'Credential Access',
    techniqueId: 'T1003',
    techniqueName: 'OS Credential Dumping',
    description: 'Credential theft from memory or local stores.',
  },
  {
    tacticId: 'TA0007',
    tacticName: 'Discovery',
    techniqueId: 'T1082',
    techniqueName: 'System Information Discovery',
    description: 'Attackers enumerate host and environment details.',
  },
  {
    tacticId: 'TA0008',
    tacticName: 'Lateral Movement',
    techniqueId: 'T1021',
    techniqueName: 'Remote Services',
    description: 'Remote services are abused for pivoting between hosts.',
  },
  {
    tacticId: 'TA0010',
    tacticName: 'Exfiltration',
    techniqueId: 'T1048',
    techniqueName: 'Exfiltration Over Alternative Protocol',
    description: 'Data is extracted over uncommon or covert channels.',
  },
  {
    tacticId: 'TA0011',
    tacticName: 'Command and Control',
    techniqueId: 'T1071',
    techniqueName: 'Application Layer Protocol',
    description: 'C2 channels use common web protocols to blend with normal traffic.',
  },
];
