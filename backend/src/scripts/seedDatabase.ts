import mongoose from 'mongoose';
import User from '../models/User';
import Disease from '../models/Disease';
import HealthcareFacility from '../models/HealthcareFacility';
import IoTDevice from '../models/IoTDevice';
import MosquitoData from '../models/MosquitoData';
import WeatherData from '../models/WeatherData';
import HealthcareData from '../models/HealthcareData';

const AREAS = [
  { name: 'Dakar', coords: [-17.4467, 14.6937], region: 'coastal' },
  { name: 'Ziguinchor', coords: [-16.2632, 12.5833], region: 'southern' },
  { name: 'Kolda', coords: [-14.9419, 12.8833], region: 'southern' },
  { name: 'Tambacounda', coords: [-13.6708, 13.7667], region: 'eastern' },
  { name: 'Kédougou', coords: [-12.1803, 12.5597], region: 'southern' },
  { name: 'Saint-Louis', coords: [-16.4889, 16.0180], region: 'northern' }
];

const MOSQUITO_TYPES = [
  'Anopheles gambiae',
  'Anopheles funestus',
  'Culex quinquefasciatus',
  'Aedes aegypti'
];

const DISEASES = [
  {
    disease_id: 'dengue',
    name: 'Dengue Fever',
    risk_factors: ['Aedes mosquitoes', 'Rainfall', 'Temperature 25-30°C', 'Humidity >70%'],
    data_sources: ['mosquito_traps', 'weather', 'healthcare'],
    icon: '🦟'
  },
  {
    disease_id: 'malaria',
    name: 'Malaria',
    risk_factors: ['Anopheles mosquitoes', 'Stagnant water', 'High humidity'],
    data_sources: ['mosquito_traps', 'weather', 'healthcare'],
    icon: '🩺'
  },
  {
    disease_id: 'zika',
    name: 'Zika Virus',
    risk_factors: ['Aedes mosquitoes', 'Urban areas', 'Warm climate'],
    data_sources: ['mosquito_traps', 'weather', 'healthcare'],
    icon: '🦠'
  },
  {
    disease_id: 'chikungunya',
    name: 'Chikungunya',
    risk_factors: ['Aedes mosquitoes', 'Temperature >20°C', 'Rainfall'],
    data_sources: ['mosquito_traps', 'weather', 'healthcare'],
    icon: '🤒'
  }
];

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Disease.deleteMany({});
  await HealthcareFacility.deleteMany({});
  await IoTDevice.deleteMany({});
  await MosquitoData.deleteMany({});
  await WeatherData.deleteMany({});
  await HealthcareData.deleteMany({});
  console.log('✅ Database cleared');
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  const users = [
    {
      username: 'admin',
      email: 'admin@hackathon.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      username: 'gov_health',
      email: 'health@gov.sg',
      password: 'health123',
      role: 'government'
    },
    {
      username: 'gov_env',
      email: 'environment@gov.sg',
      password: 'env123',
      role: 'government'
    }
  ];
  
  await User.insertMany(users);
  console.log(`✅ Created ${users.length} users`);
}

async function seedDiseases() {
  console.log('🦠 Seeding diseases...');
  await Disease.insertMany(DISEASES);
  console.log(`✅ Created ${DISEASES.length} diseases`);
}

async function seedHealthcareFacilities() {
  console.log('🏥 Seeding healthcare facilities...');
  const facilities: Array<{
    facility_id: string;
    name: string;
    type: 'hospital' | 'clinic' | 'health_center';
    location: { type: 'Point'; coordinates: number[] };
    contact: string;
    total_capacity: number;
    services: string[];
  }> = [];
  
  AREAS.forEach((area, idx) => {
    facilities.push({
      facility_id: `FAC-${String(idx + 1).padStart(3, '0')}`,
      name: `${area.name} General Hospital`,
      type: idx % 3 === 0 ? 'hospital' : idx % 3 === 1 ? 'clinic' : 'health_center',
      location: {
        type: 'Point',
        coordinates: area.coords!
      },
      contact: `+221-33-${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`,
      total_capacity: idx % 3 === 0 ? 200 : idx % 3 === 1 ? 50 : 100,
      services: ['Emergency Care', 'Infectious Diseases', 'Laboratory', 'Pharmacy']
    });
  });
  
  await HealthcareFacility.insertMany(facilities);
  console.log(`✅ Created ${facilities.length} healthcare facilities`);
  return facilities;
}

async function seedIoTDevices() {
  console.log('📡 Seeding IoT devices...');
  const devices: Array<{
    device_id: string;
    location: { type: 'Point'; coordinates: number[] };
    area_name: string;
    status: 'active';
    last_ping: Date;
  }> = [];
  
  AREAS.forEach((area) => {
    for (let i = 0; i < 3; i++) {
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lonOffset = (Math.random() - 0.5) * 0.02;
      
      devices.push({
        device_id: `IOT-${area.name.toUpperCase().replace(/\s/g, '')}-${String(i + 1).padStart(2, '0')}`,
        location: {
          type: 'Point',
          coordinates: [area.coords![0]! + lonOffset, area.coords![1]! + latOffset]
        },
        area_name: area.name,
        status: 'active',
        last_ping: new Date()
      });
    }
  });
  
  await IoTDevice.insertMany(devices);
  console.log(`✅ Created ${devices.length} IoT devices`);
  return devices;
}

async function seedMosquitoData(devices: Array<{ device_id: string; location: any; area_name: string }>) {
  console.log('🦟 Seeding mosquito data (7 days) with Senegal patterns...');
  const mosquitoData: Array<{
    device_id: string;
    location: any;
    mosquito_breakdown: Array<{ mosquito_type: string; count: number }>;
    total_count: number;
    timestamp: Date;
    metadata: { confidence: number; sensor_health: string };
  }> = [];
  const now = new Date();
  
  for (let day = 6; day >= 0; day--) {
    const seasonalMultiplier = 1 + (Math.sin(day * Math.PI / 30) * 0.3);
    
    for (const device of devices) {
      const areaInfo = AREAS.find(a => a.name === device.area_name);
      const region = areaInfo?.region || 'coastal';
      
      const regionalMultiplier = region === 'southern' ? 1.5 : region === 'eastern' ? 1.2 : region === 'coastal' ? 0.7 : 1.0;
      
      for (let hour = 0; hour < 24; hour += 2) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        const mosquito_breakdown: Array<{ mosquito_type: string; count: number }> = [];
        
        MOSQUITO_TYPES.forEach(type => {
          let timeMultiplier = 1.0;
          let baseCount = 10 + Math.random() * 30;
          
          if (type.includes('Anopheles')) {
            if ((hour >= 18 && hour <= 22) || (hour >= 4 && hour <= 6)) {
              timeMultiplier = 2.5;
            } else if (hour >= 0 && hour <= 3) {
              timeMultiplier = 1.2;
            } else {
              timeMultiplier = 0.3;
            }
            baseCount *= regionalMultiplier;
          } else if (type.includes('Culex')) {
            if (hour >= 20 || hour <= 4) {
              timeMultiplier = 2.0;
            } else if (hour >= 18 && hour <= 19) {
              timeMultiplier = 1.5;
            } else {
              timeMultiplier = 0.4;
            }
          } else if (type.includes('Aedes')) {
            if (hour >= 6 && hour <= 10) {
              timeMultiplier = 1.8;
            } else if (hour >= 16 && hour <= 18) {
              timeMultiplier = 1.6;
            } else {
              timeMultiplier = 0.5;
            }
          }
          
          const noise = 0.7 + Math.random() * 0.6;
          const count = Math.floor(baseCount * timeMultiplier * seasonalMultiplier * noise);
          
          if (count > 0) {
            mosquito_breakdown.push({
              mosquito_type: type,
              count
            });
          }
        });
        
        const total_count = mosquito_breakdown.reduce((sum, m) => sum + m.count, 0);
        
        if (total_count > 0) {
          mosquitoData.push({
            device_id: device.device_id,
            location: device.location,
            mosquito_breakdown,
            total_count,
            timestamp,
            metadata: {
              confidence: 0.82 + Math.random() * 0.16,
              sensor_health: Math.random() > 0.95 ? 'maintenance_needed' : 'good'
            }
          });
        }
      }
    }
  }
  
  await MosquitoData.insertMany(mosquitoData);
  console.log(`✅ Created ${mosquitoData.length} mosquito data records`);
}

async function seedWeatherData() {
  console.log('🌦️  Seeding weather data (7 days)...');
  const weatherData = [];
  const now = new Date();
  
  for (let day = 6; day >= 0; day--) {
    for (const area of AREAS) {
      for (let hour = 0; hour < 24; hour += 2) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        const baseTemp = 26 + Math.sin((hour - 6) * Math.PI / 12) * 4;
        const temperature = baseTemp + (Math.random() - 0.5) * 2;
        
        const baseHumidity = 75 - Math.sin((hour - 6) * Math.PI / 12) * 15;
        const humidity = Math.max(50, Math.min(95, baseHumidity + (Math.random() - 0.5) * 10));
        
        const isRaining = Math.random() < 0.3;
        const rainfall = isRaining ? Math.random() * 20 : 0;
        
        weatherData.push({
          location: {
            type: 'Point',
            coordinates: area.coords
          },
          area_name: area.name,
          temperature: Math.round(temperature * 10) / 10,
          humidity: Math.round(humidity * 10) / 10,
          rainfall: Math.round(rainfall * 10) / 10,
          timestamp
        });
      }
    }
  }
  
  await WeatherData.insertMany(weatherData);
  console.log(`✅ Created ${weatherData.length} weather data records`);
}

async function seedHealthcareData(facilities: Array<{ facility_id: string; name: string; location: any; total_capacity: number }>) {
  console.log('🏥 Seeding healthcare data (7 days)...');
  const healthcareData = [];
  const now = new Date();
  
  for (let day = 6; day >= 0; day--) {
    for (const facility of facilities) {
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - day);
      timestamp.setHours(12, 0, 0, 0);
      
      const capacityUsage = 0.4 + Math.random() * 0.4;
      const current_patients = Math.floor(facility.total_capacity * capacityUsage);
      const available_beds = facility.total_capacity - current_patients;
      
      const dengueCases = Math.floor(current_patients * (0.3 + Math.random() * 0.2));
      const malariaCases = Math.floor(current_patients * (0.1 + Math.random() * 0.1));
      const zikaCases = Math.floor(current_patients * (0.05 + Math.random() * 0.05));
      const chikungunyaCases = Math.floor(current_patients * (0.08 + Math.random() * 0.07));
      const otherCases = current_patients - dengueCases - malariaCases - zikaCases - chikungunyaCases;
      
      healthcareData.push({
        facility_id: facility.facility_id,
        facility_name: facility.name,
        location: facility.location,
        area_name: AREAS.find(a => 
          a.coords[0] === facility.location.coordinates[0] && 
          a.coords[1] === facility.location.coordinates[1]
        )?.name || 'Unknown',
        current_patients,
        total_capacity: facility.total_capacity,
        available_beds,
        disease_breakdown: [
          { disease: 'Dengue Fever', count: dengueCases },
          { disease: 'Malaria', count: malariaCases },
          { disease: 'Zika Virus', count: zikaCases },
          { disease: 'Chikungunya', count: chikungunyaCases },
          { disease: 'Other', count: Math.max(0, otherCases) }
        ].filter(d => d.count > 0),
        timestamp,
        submitted_at: new Date(timestamp.getTime() + Math.random() * 3600000)
      });
    }
  }
  
  await HealthcareData.insertMany(healthcareData);
  console.log(`✅ Created ${healthcareData.length} healthcare data records`);
}

async function seedDatabase() {
  try {
    await connectDB();
    await clearDatabase();
    
    await seedUsers();
    await seedDiseases();
    const facilities = await seedHealthcareFacilities();
    const devices = await seedIoTDevices();
    
    await seedMosquitoData(devices);
    await seedWeatherData();
    await seedHealthcareData(facilities);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Diseases: ${await Disease.countDocuments()}`);
    console.log(`   - Healthcare Facilities: ${await HealthcareFacility.countDocuments()}`);
    console.log(`   - IoT Devices: ${await IoTDevice.countDocuments()}`);
    console.log(`   - Mosquito Data: ${await MosquitoData.countDocuments()}`);
    console.log(`   - Weather Data: ${await WeatherData.countDocuments()}`);
    console.log(`   - Healthcare Data: ${await HealthcareData.countDocuments()}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@hackathon.com / admin123');
    console.log('   Gov Health: health@gov.sg / health123');
    console.log('   Gov Env: environment@gov.sg / env123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

seedDatabase();
