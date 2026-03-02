
import { EVSTask, KPIData, IntegrationStatus, Notification, IntegrationDetail, Asset, RoomDetail, MaintenanceDevice, MaintenanceLog, FacilityZoneCoverage } from './types';

export const FACILITIES = [
  "All Facilities",
  "HCA Florida Mercy Hospital",
  "HCA Houston Healthcare Medical Center",
  "HCA Florida Aventura Hospital",
  "HCA Houston Healthcare Northwest",
  "HCA Florida Kendall Hospital",
  "HCA Houston Healthcare Southeast",
  "HCA Florida Woodmont Hospital",
  "HCA Houston Healthcare Kingwood",
  "HCA Florida Westside Hospital",
  "HCA Houston Healthcare Tomball"
];
export const DEPARTMENTS = ["All Departments", "EVS", "Transport", "Engineering", "BioMed"];

const generateSparkline = (points: number = 20) => Array.from({ length: points }, () => Math.floor(Math.random() * 40) + 60);

const STAFF_NAMES = ["Marcus J.", "Sarah L.", "Robert D.", "Elena G.", "David W.", "Lisa K.", "Tom H.", "Nancy P.", "James B.", "Linda S.", "Kevin M.", "Julie V.", "Chris R.", "Maria Z.", "Steven T."];

// Helper to generate tasks spanning from Sep 2025 to today
const generateTasks = (count: number): EVSTask[] => {
  const startDate = new Date('2025-09-01T08:00:00Z');
  const now = new Date();
  
  const effectiveEnd = now > startDate ? now : new Date('2025-12-31T23:59:59Z');
  const totalDurationMs = effectiveEnd.getTime() - startDate.getTime();

  return Array.from({ length: count }, (_, i) => {
    const taskDate = new Date(startDate.getTime() + (Math.random() * totalDurationMs));
    
    let status: any;
    let specificDate = taskDate;
    
    if (i < 40) { // Increased "In Progress" count for better map visuals
      status = 'In Progress';
      specificDate = new Date(); 
    } else {
      const mod = i % 10;
      if (mod < 7) {
        status = 'Complete';
      } else if (mod < 9) {
        status = 'Not Started';
      } else {
        status = 'Canceled';
      }
    }
    
    // Categorization logic updated for Daily Cleans and Patient Transports
    let category: any;
    let description: string;
    
    const rand = i % 10;
    if (rand < 4) {
      category = 'EVS';
      description = i % 2 === 0 ? 'Daily Clean' : 'Discharge Clean';
    } else if (rand < 7) {
      category = 'Transport';
      description = 'Patient Transport';
    } else if (rand < 8) {
      category = 'BioMed';
      description = 'Biomedical Equipment Check';
    } else {
      category = 'Engineering';
      description = 'Engineering HVAC Maintenance';
    }
    
    const facility = FACILITIES[1 + (i % (FACILITIES.length - 1))];
    
    let assignedTo = undefined;
    if (status === 'In Progress' || status === 'Complete') {
      assignedTo = STAFF_NAMES[i % STAFF_NAMES.length];
    } else if (i % 4 !== 0) {
      assignedTo = STAFF_NAMES[i % STAFF_NAMES.length];
    }
    
    const expectedDuration = category === 'Transport' ? 20 + (i % 3) * 5 : 30 + (i % 6) * 15;
    
    let startTime;
    let endTime;
    
    if (status === 'In Progress' || status === 'Complete') {
      const start = new Date(specificDate);
      start.setMinutes(start.getMinutes() - (15 + (i % 45)));
      startTime = start.toISOString();

      if (status === 'Complete') {
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + expectedDuration - (i % 8)); 
        endTime = end.toISOString();
      }
    }

    return {
      id: `T${i + 1}`,
      roomNumber: `${100 + (i % 200)}-${String.fromCharCode(65 + (i % 4))}`, 
      category,
      facility,
      description,
      status,
      assignedTo,
      startTime,
      endTime,
      expectedDuration,
      isEscalated: i % 13 === 0 && status === 'In Progress',
      priority: i % 5 === 0 ? 'High' : i % 5 < 3 ? 'Medium' : 'Low',
      createdAt: specificDate.toISOString(),
      location: { x: 10 + Math.random() * 80, y: 15 + Math.random() * 70 }
    };
  });
};

export const MOCK_TASKS: EVSTask[] = generateTasks(300); // More tasks for better density

export const MOCK_ASSETS: Asset[] = Array.from({ length: 25 }, (_, i) => {
  const types = ['Heart Pump', 'IV Pump', 'Heart Monitor', 'ECG', 'Ventilator', 'Defibrillator'];
  const type = types[i % types.length];
  const statuses: ('Available' | 'In Use' | 'Maintenance')[] = ['Available', 'In Use', 'Maintenance'];
  return {
    id: `AS-${101 + i}`,
    name: `${type} ${String(i + 1).padStart(2, '0')}`,
    type,
    status: statuses[i % 3],
    location: { x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 }
  };
});

export const MOCK_FACILITY_ZONE_COVERAGE: FacilityZoneCoverage[] = FACILITIES.filter(f => f !== 'All Facilities').map(f => {
  const zoneNames = ["Emergency Dept (ED)", "Operating Rooms (OR)", "ICU North", "MedSurg 4 West", "MedSurg 2 East", "Labor & Delivery", "Oncology Unit", "Pediatrics Unit"];
  const zones = zoneNames.map((name, idx) => {
    const evsCount = Math.floor(Math.random() * 10) + 15; // Increased staff count per zone
    const staff = Array.from({ length: evsCount }, (_, sIdx) => ({
      name: STAFF_NAMES[(idx + sIdx) % STAFF_NAMES.length],
      role: "EVS Technician",
      currentTask: Math.random() > 0.3 ? `Cleaning Room ${200 + idx}${sIdx}` : undefined,
      shift: "Day Shift (07:00 - 15:00)",
      efficiency: Math.floor(Math.random() * 20) + 80
    }));

    return {
      id: `zone-${f.substring(0, 3)}-${idx}`,
      name,
      floor: `${Math.floor(Math.random() * 5) + 1}`,
      health: Math.floor(Math.random() * 30) + 70,
      evsCount,
      assignedStaff: staff,
      history90d: generateSparkline(90)
    };
  });
  
  const overallHealth = Math.round(zones.reduce((acc, z) => acc + z.health, 0) / zones.length);
  
  return {
    facility: f,
    overallHealth,
    history90d: generateSparkline(90),
    zones
  };
});

export const KPI_OUTCOMES: KPIData[] = [
  {
    id: 'k_scost',
    label: 'Supply Costs',
    value: '84,200',
    unit: '$',
    trend: 3.4,
    sparkline: [40, 45, 42, 50, 55, 60, 58, 62, 70, 75, 72, 80, 84],
    category: 'Financial',
    description: 'Expenditure on operational supplies over time'
  },
  {
    id: 'k_ssave',
    label: 'Supply Savings',
    value: '12,650',
    unit: '$',
    trend: 15.2,
    sparkline: [5, 8, 10, 12, 15, 18, 22, 25, 20, 28, 32, 35, 40],
    category: 'Financial',
    description: 'Calculated savings from inventory optimization'
  },
  {
    id: 'k10',
    label: 'Room Downtime Cost',
    value: '12,450',
    unit: '$',
    trend: -8.7,
    sparkline: generateSparkline(),
    category: 'Financial',
    description: 'Estimated lost revenue from delays'
  },
  {
    id: 'k_deadbed',
    label: 'Dead Bed Costs',
    value: '45,800',
    unit: '$',
    trend: 12.4,
    sparkline: generateSparkline(),
    category: 'Financial',
    description: 'Opportunity cost of vacant ready beds across the facility'
  },
  {
    id: 'k1',
    label: 'Mean Time to Patient Ready',
    value: '42.5',
    unit: 'min',
    trend: -5.2,
    sparkline: generateSparkline(),
    category: 'Speed',
    description: 'Total time from discharge to room ready'
  },
  {
    id: 'k2',
    label: 'Turnover Latency',
    value: '8.2',
    unit: 'min',
    trend: 12.5,
    sparkline: generateSparkline(),
    category: 'Speed',
    description: 'Dead time between assignment and start'
  },
  {
    id: 'k_art',
    label: 'Average Response Time',
    value: '6.4',
    unit: 'min',
    trend: -12.3,
    sparkline: generateSparkline(),
    category: 'Speed',
    description: 'Time from task creation to worker assignment'
  },
  {
    id: 'k_dirty_occ',
    label: 'Average Dirty to Occupied Time',
    value: '54.2',
    unit: 'min',
    trend: -4.2,
    sparkline: generateSparkline(),
    category: 'Efficiency',
    description: 'Total elapsed time from discharge to new patient admission'
  },
  {
    id: 'k4',
    label: 'Task Variance',
    value: '14',
    unit: '%',
    trend: -2.3,
    sparkline: generateSparkline(),
    category: 'Efficiency',
    description: 'Delta between standard and actual time'
  },
  {
    id: 'k5',
    label: 'Wrench Time',
    value: '72',
    unit: '%',
    trend: 6.8,
    sparkline: generateSparkline(),
    category: 'Efficiency',
    description: 'Percentage of shift spent "on task"'
  },
  {
    id: 'k6',
    label: 'Path Optimization',
    value: '18',
    unit: '%',
    trend: 15.4,
    sparkline: generateSparkline(),
    category: 'Efficiency',
    description: 'Reduction in travel distance'
  },
  {
    id: 'k_lb',
    label: 'Load Balancing',
    value: '84',
    unit: '%',
    trend: 2.1,
    sparkline: generateSparkline(),
    category: 'Workforce',
    description: 'Resource usage equality across tasks'
  },
  {
    id: 'k_sched_health',
    label: 'Schedule Health',
    value: '92',
    unit: '%',
    trend: 4.8,
    sparkline: [80, 82, 85, 84, 88, 90, 89, 91, 92, 94, 93, 92, 92],
    category: 'Workforce',
    description: 'Ratio of available staff to total headcount'
  },
  {
    id: 'k_zone_health',
    label: 'Zone Coverage Health',
    value: '88',
    unit: '%',
    trend: 4.2,
    sparkline: [82, 85, 84, 88, 86, 89, 90, 88, 87, 88, 89, 88, 88],
    category: 'Workforce',
    description: 'Overall EVS staffing distribution across critical zones'
  },
  {
    id: 'k_turnover',
    label: 'Staffing Turnover Rate',
    value: '14.2',
    unit: '%',
    trend: -2.1,
    sparkline: [18, 17, 18, 16, 15, 16, 14, 15, 14, 14, 15, 14, 14],
    category: 'Workforce',
    description: 'Annualized rate of staff departures across the facility.'
  },
  {
    id: 'k7',
    label: 'Asset Uptime (BioMed)',
    value: '99.4',
    unit: '%',
    trend: 0.2,
    sparkline: generateSparkline(),
    category: 'Quality',
    description: 'Percentage of time equipment is available'
  },
  {
    id: 'k8',
    label: 'First-Time Fix Rate',
    value: '91',
    unit: '%',
    trend: 3.5,
    sparkline: generateSparkline(),
    category: 'Quality',
    description: 'Issues resolved on first visit'
  },
  {
    id: 'k9',
    label: 'BioMed PM Compliance',
    value: '100',
    unit: '%',
    trend: 0,
    sparkline: generateSparkline(),
    category: 'Quality',
    description: 'Maintenance tasks completed on schedule'
  },
  {
    id: 'k11',
    label: 'Safety Incident Rate',
    value: '0.12',
    unit: '/1000h',
    trend: -22.1,
    sparkline: generateSparkline(),
    category: 'Quality',
    description: 'Correlated slips/trips/falls'
  }
];

const generateMaintenanceHistory = (deviceId: string): MaintenanceLog[] => {
  const actions = ["Annual Calibration", "Filter Replacement", "Safety Check", "Software Update", "Battery Replacement", "Internal Inspection"];
  const technicians = ["Robert D.", "Elena G.", "Marcus J.", "Sarah L.", "Lisa K."];
  
  return Array.from({ length: 4 + Math.floor(Math.random() * 5) }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (i * 4));
    return {
      id: `LOG-${deviceId}-${i}`,
      date: date.toISOString(),
      action: actions[i % actions.length],
      technician: technicians[i % technicians.length],
      notes: `Standard ${actions[i % actions.length]} procedure completed without anomalies.`,
      status: Math.random() > 0.1 ? 'Pass' : 'Fail'
    };
  });
};

const generateMaintenanceDevices = (): MaintenanceDevice[] => {
  const names = [
    { name: "IV Pump X400", category: "BioMed", type: "Infusion Pump", manufacturer: "Baxter" },
    { name: "Heart Monitor V1", category: "BioMed", type: "Patient Monitor", manufacturer: "Philips" },
    { name: "MRI Scanner 01", category: "BioMed", type: "Imaging", manufacturer: "Siemens" },
    { name: "HVAC Unit AHU-04", category: "Engineering", type: "Air Handler", manufacturer: "Trane" },
    { name: "Emergency Generator B", category: "Engineering", type: "Power", manufacturer: "Caterpillar" },
    { name: "Biohazard Autoclave", category: "BioMed", type: "Sterilizer", manufacturer: "Midmark" },
    { name: "Medical Air Comp", category: "Engineering", type: "Pneumatics", manufacturer: "BeaconMedaes" },
    { name: "Patient Bed G5", category: "BioMed", type: "Furniture", manufacturer: "Stryker" },
    { name: "X-Ray Portable", category: "BioMed", type: "Imaging", manufacturer: "GE Healthcare" },
    { name: "Boiler B2", category: "Engineering", type: "Heating", manufacturer: "Cleaver-Brooks" },
    { name: "Ventilator Servo-U", category: "BioMed", type: "Respiratory", manufacturer: "Getinge" },
    { name: "Centrifuge Lab-X", category: "BioMed", type: "Laboratory", manufacturer: "Thermo Fisher" },
    { name: "Chiller CH-01", category: "Engineering", type: "Cooling", manufacturer: "Carrier" },
    { name: "Defibrillator M-Series", category: "BioMed", type: "Cardiac", manufacturer: "Zoll" },
    { name: "Steam Generator", category: "Engineering", type: "Sterilization", manufacturer: "Spirax Sarco" }
  ];

  return Array.from({ length: 30 }, (_, i) => {
    const template = names[i % names.length];
    const id = `${template.category.substring(0, 1)}-${1000 + i}`;
    const history = generateMaintenanceHistory(id);
    const installDate = new Date();
    installDate.setFullYear(installDate.getFullYear() - (1 + Math.floor(Math.random() * 5)));
    
    const warranty = new Date(installDate);
    warranty.setFullYear(warranty.getFullYear() + 3);

    return {
      id,
      name: `${template.name} #${i + 1}`,
      category: template.category as any,
      type: template.type,
      facility: FACILITIES[1 + (i % (FACILITIES.length - 1))],
      manufacturer: template.manufacturer,
      model: `${template.name.split(' ')[0]}-2024-X`,
      serialNumber: `SN-${Math.random().toString(36).substring(7).toUpperCase()}`,
      installDate: installDate.toISOString(),
      warrantyExpiration: warranty.toISOString(),
      lastMaintenanceDate: history[0].date,
      lastMaintenanceAction: history[0].action,
      status: Math.random() > 0.85 ? 'Repair Needed' : 'Operational',
      history
    };
  });
};

export const MOCK_MAINTENANCE_DEVICES = generateMaintenanceDevices();

export const getMockRoomDetail = (roomNumber: string, facility: string): RoomDetail => {
  let roomTasks = MOCK_TASKS.filter(t => t.roomNumber === roomNumber);
  
  // If no tasks found for this room, synthesize some to ensure data is visible in the UI
  if (roomTasks.length < 3) {
    const synthesized: EVSTask[] = [
      {
        id: `SYN-${roomNumber}-1`,
        roomNumber,
        category: 'BioMed',
        facility,
        description: 'Scheduled Device Calibration',
        status: 'Complete',
        assignedTo: 'Robert D.',
        expectedDuration: 45,
        priority: 'Medium',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        endTime: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
        location: { x: 50, y: 50 }
      },
      {
        id: `SYN-${roomNumber}-2`,
        roomNumber,
        category: 'Engineering',
        facility,
        description: 'HVAC Filter Replacement',
        status: 'Complete',
        assignedTo: 'Elena G.',
        expectedDuration: 30,
        priority: 'Low',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        endTime: new Date(Date.now() - 86400000 * 5 + 1200000).toISOString(),
        location: { x: 50, y: 50 }
      },
      {
        id: `SYN-${roomNumber}-3`,
        roomNumber,
        category: 'EVS',
        facility,
        description: 'Daily Disinfectant Wipe-down',
        status: 'Complete',
        assignedTo: 'Sarah L.',
        expectedDuration: 20,
        priority: 'Medium',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        endTime: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        location: { x: 50, y: 50 }
      }
    ];
    roomTasks = [...roomTasks, ...synthesized];
  }

  const roomAssets = MOCK_ASSETS.slice(0, 3);
  const roomTypes: RoomDetail['type'][] = ['ICU', 'MedSurg', 'Emergency', 'Surgery', 'Isolation'];
  const patients = ['Jameson, Robert', 'White, Sarah', 'Chen, Wei', 'Martinez, Elena', 'Wilson, David', null];
  
  return {
    roomNumber,
    facility,
    type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
    patientName: patients[Math.floor(Math.random() * patients.length)] || undefined,
    temperature: 68 + Math.random() * 6,
    humidity: 40 + Math.random() * 20,
    pressure: Math.random() > 0.8 ? 'Negative' : 'Neutral',
    assets: roomAssets,
    inventory: [
      { item: 'N95 Masks', quantity: 12, unit: 'box', minThreshold: 10 },
      { item: 'Biohazard Liners', quantity: 45, unit: 'ea', minThreshold: 30 },
      { item: 'Sanitizer Wipes', quantity: 2, unit: 'canister', minThreshold: 5 },
      { item: 'Isolation Gowns', quantity: 80, unit: 'ea', minThreshold: 50 },
    ],
    recentMaintenance: roomTasks.filter(t => t.category === 'Engineering' || t.category === 'BioMed').slice(0, 3),
    recentCleaning: roomTasks.filter(t => t.category === 'EVS').slice(0, 3),
  };
};

export const MOCK_INTEGRATIONS: IntegrationStatus[] = [
  { name: 'ServiceNow', status: 'active', lastSync: '2 mins ago' },
  { name: 'Johnson Controls', status: 'active', lastSync: '1 min ago' }
];

export const JCI_INTEGRATION_DETAIL: IntegrationDetail = {
  name: 'Johnson Controls',
  apiEndpoint: 'https://api.metasys.hca.health/api/v4',
  version: '4.1.0-RC2',
  authStatus: 'Authenticated (JWT)',
  latency: '42ms',
  activeAlarms: 2,
  points: [
    { id: '5521-OR1-PRES', name: 'OR 1 Differential Pressure', type: 'Pressure', value: '0.03', unit: 'in WC', status: 'normal', location: 'Surgery Wing - OR 1' },
    { id: '5521-OR2-PRES', name: 'OR 2 Differential Pressure', type: 'Pressure', value: '0.01', unit: 'in WC', status: 'alarm', location: 'Surgery Wing - OR 2' },
    { id: '1004-ISO-TEMP', name: 'Isolation Room 104 Temp', type: 'Temperature', value: '68.4', unit: '°F', status: 'normal', location: 'Infection Control Unit' },
    { id: 'AHU-1-SUPPLY', name: 'AHU-1 Supply Fan Status', type: 'Fan Status', value: 'ON', unit: 'binary', status: 'normal', location: 'Roof Mech Penthouse' },
    { id: 'PHAR-F1-TEMP', name: 'Pharmacy Fridge 1', type: 'Temperature', value: '38.2', unit: '°F', status: 'normal', location: 'Main Pharmacy' },
    { id: 'LAB-H3-HUM', name: 'Main Lab Humidity', type: 'Humidity', value: '64', unit: '% RH', status: 'alarm', location: 'Laboratory Services' },
    { id: 'MED-GAS-OX', name: 'Main Oxygen Pressure', type: 'Gas Pressure', value: '55.4', unit: 'PSI', status: 'normal', location: 'Bulk Gas Storage' }
  ]
};

export const SERVICENOW_INTEGRATION_DETAIL: IntegrationDetail = {
  name: 'ServiceNow',
  apiEndpoint: 'https://hca_health.service-now.com/api/now/table',
  version: 'Washington DC (v2)',
  authStatus: 'OAuth 2.0 (Active)',
  latency: '118ms',
  activeAlarms: 3,
  points: [
    { id: 'INC00291', name: 'Leaking Biohazard Disposal', type: 'Incident', value: 'P1', unit: 'Priority', status: 'alarm', location: 'Pathology Lab B' },
    { id: 'REQ04221', name: 'EVS Supply Replenishment', type: 'Request', value: 'Open', unit: 'Status', status: 'normal', location: 'Central Supply' },
    { id: 'INC00842', name: 'Ventilation Failure', type: 'Incident', value: 'P2', unit: 'Priority', status: 'alarm', location: 'Intensive Care Unit (ICU)' },
    { id: 'INC00115', name: 'BioMed Pump Calibration', type: 'Incident', value: 'P3', unit: 'Priority', status: 'normal', location: 'North Wing Nursing' },
    { id: 'REQ05120', name: 'New Staff Access Badges', type: 'Request', value: 'Pending', unit: 'Status', status: 'normal', location: 'Human Resources' },
    { id: 'INC00732', name: 'Broken Gurney Repair', type: 'Incident', value: 'P4', unit: 'Priority', status: 'normal', location: 'Emergency Dept' },
    { id: 'SYNC-CMDB', name: 'CMDB Asset Sync', type: 'System', value: '99.2', unit: '% Success', status: 'normal', location: 'Data Center' }
  ]
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n0',
    title: 'Urgent: Temperature Alert',
    message: 'Wing B Room 204 temperature below threshold (62°F). Engineering research required immediately.',
    type: 'urgent',
    timestamp: 'Just now',
    read: false
  },
  {
    id: 'n1',
    title: 'New High Priority Task',
    message: 'Room 501 requires urgent EVS attention (Biohazard).',
    type: 'urgent',
    timestamp: '5 mins ago',
    read: false
  },
  {
    id: 'n2',
    title: 'BioMed Alert',
    message: 'MRI Unit 2 daily calibration check due.',
    type: 'info',
    timestamp: '1 hour ago',
    read: true
  },
  {
    id: 'n3',
    title: 'Water Leak Reported',
    message: 'Janitors closet near Lobby A reports significant standing water. Engineering dispatched.',
    type: 'warning',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'n4',
    title: 'Shift Change Approaching',
    message: 'Day shift concludes in 30 minutes. Please ensure all active tasks have proper handover notes.',
    type: 'info',
    timestamp: '3 hours ago',
    read: false
  },
  {
    id: 'n5',
    title: 'System Maintenance',
    message: 'ServiceNow bridge will undergo scheduled maintenance at 02:00 AM EST tonight.',
    type: 'info',
    timestamp: '4 hours ago',
    read: true
  },
  {
    id: 'n6',
    title: 'Critical Supply Low',
    message: 'N95 Mask inventory in HCA Houston Healthcare Southeast is below safety threshold. Order placed.',
    type: 'urgent',
    timestamp: '5 hours ago',
    read: false
  },
  {
    id: 'n7',
    title: 'BioMed PM Completed',
    message: 'Preventative Maintenance on Ventilator Unit #5422-C finished successfully.',
    type: 'info',
    timestamp: '6 hours ago',
    read: true
  },
  {
    id: 'n8',
    title: 'Unusual Power Draw',
    message: 'Main Lab AHU-1 reports power draw spike. Monitoring for potential motor failure.',
    type: 'warning',
    timestamp: '7 hours ago',
    read: false
  },
  {
    id: 'n9',
    title: 'New Employee Onboarded',
    message: 'Steven T. has completed orientation and is now available for EVS assignments.',
    type: 'info',
    timestamp: '8 hours ago',
    read: true
  },
  {
    id: 'n10',
    title: 'Negative Pressure Alarm',
    message: 'Isolation Room 104 differential pressure is outside of surgical parameters. Urgent check required.',
    type: 'urgent',
    timestamp: '10 hours ago',
    read: false
  },
  {
    id: 'n11',
    title: 'Waste Management Pickup',
    message: 'Scheduled biohazard waste pickup confirmed for tomorrow at 09:00 AM.',
    type: 'info',
    timestamp: '12 hours ago',
    read: true
  },
  {
    id: 'n12',
    title: 'Elevator 4 Out of Service',
    message: 'Service Elevator 4 is down for inspection. Expect minor delays in supply distribution.',
    type: 'warning',
    timestamp: '14 hours ago',
    read: false
  }
];
