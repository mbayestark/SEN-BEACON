import RiskZone from '../models/RiskZone';
import MosquitoData from '../models/MosquitoData';
import HealthcareData from '../models/HealthcareData';
import WeatherData from '../models/WeatherData';
import Disease from '../models/Disease';

export const calculateRiskZones = async (): Promise<void> => {
  try {
    console.log(' Starting risk zone calculation...');

    const diseases = await Disease.find();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const disease of diseases) {
      if (disease.disease_id === 'malaria') {
        await calculateMalariaRisk(oneDayAgo);
      }
    }

    console.log(' Risk zone calculation completed');
  } catch (error) {
    console.error('  Error calculating risk zones:', error);
  }
};

const calculateMalariaRisk = async (since: Date): Promise<void> => {
  const mosquitoData = await MosquitoData.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: '$device_id',
        avg_count: { $avg: '$count' },
        total_count: { $sum: '$count' },
        location: { $first: '$location' }
      }
    }
  ]);

  const weatherData = await WeatherData.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: '$area_name',
        avg_humidity: { $avg: '$humidity' },
        avg_temperature: { $avg: '$temperature' },
        total_rainfall: { $sum: '$rainfall' },
        location: { $first: '$location' }
      }
    }
  ]);

  const areaRisks = new Map<string, any>();

  for (const data of mosquitoData) {
    const areaName = `Area_${data._id}`;
    
    const mosquitoFactor = Math.min(data.avg_count / 100, 1);
    
    const weather = weatherData.find(w => w._id === areaName) || { avg_humidity: 50, avg_temperature: 25 };
    const humidityFactor = weather.avg_humidity > 70 ? 0.8 : weather.avg_humidity > 50 ? 0.5 : 0.2;
    const tempFactor = (weather.avg_temperature >= 20 && weather.avg_temperature <= 30) ? 0.7 : 0.3;
    
    const riskScore = (mosquitoFactor * 0.5) + (humidityFactor * 0.3) + (tempFactor * 0.2);
    
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore >= 0.7) riskLevel = 'high';
    else if (riskScore >= 0.4) riskLevel = 'medium';
    else riskLevel = 'low';

    areaRisks.set(areaName, {
      area_name: areaName,
      location: data.location,
      disease_id: 'malaria',
      risk_level: riskLevel,
      factors: [
        { factor: 'mosquito_density', value: data.avg_count, weight: 0.5 },
        { factor: 'humidity', value: weather.avg_humidity, weight: 0.3 },
        { factor: 'temperature', value: weather.avg_temperature, weight: 0.2 }
      ],
      last_updated: new Date()
    });
  }

  for (const [areaName, riskData] of areaRisks) {
    await RiskZone.findOneAndUpdate(
      { area_name: areaName, disease_id: 'malaria' },
      riskData,
      { upsert: true, new: true }
    );
  }

  console.log(`Updated ${areaRisks.size} malaria risk zones`);
};
