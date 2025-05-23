import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const mockStats = {
  totaalKlanten: 5251,
  zendingenVandaag: 7916,
  maandZendingen: 59525,
  jaarOmzet: 65152,
};

const omzetData = [
  { maand: 'Jan', omzet: 4000 },
  { maand: 'Feb', omzet: 3000 },
  { maand: 'Mar', omzet: 5000 },
  { maand: 'Apr', omzet: 4780 },
  { maand: 'Mei', omzet: 5890 },
  { maand: 'Jun', omzet: 6390 },
  { maand: 'Jul', omzet: 7490 },
  { maand: 'Aug', omzet: 8000 },
  { maand: 'Sep', omzet: 7000 },
  { maand: 'Okt', omzet: 6700 },
  { maand: 'Nov', omzet: 7200 },
  { maand: 'Dec', omzet: 8100 },
];

const zendingenData = [
  { dag: 'Ma', aantal: 1200 },
  { dag: 'Di', aantal: 2100 },
  { dag: 'Wo', aantal: 800 },
  { dag: 'Do', aantal: 1600 },
  { dag: 'Vr', aantal: 900 },
  { dag: 'Za', aantal: 1700 },
  { dag: 'Zo', aantal: 1100 },
];

const klantenData = [
  { maand: 'Jan', klanten: 400 },
  { maand: 'Feb', klanten: 420 },
  { maand: 'Mar', klanten: 430 },
  { maand: 'Apr', klanten: 450 },
  { maand: 'Mei', klanten: 470 },
  { maand: 'Jun', klanten: 480 },
  { maand: 'Jul', klanten: 500 },
  { maand: 'Aug', klanten: 520 },
  { maand: 'Sep', klanten: 540 },
  { maand: 'Okt', klanten: 560 },
  { maand: 'Nov', klanten: 580 },
  { maand: 'Dec', klanten: 600 },
];

const maandZendingenData = [
  { maand: 'Jan', zendingen: 4000 },
  { maand: 'Feb', zendingen: 4200 },
  { maand: 'Mar', zendingen: 4300 },
  { maand: 'Apr', zendingen: 4500 },
  { maand: 'Mei', zendingen: 4700 },
  { maand: 'Jun', zendingen: 4800 },
  { maand: 'Jul', zendingen: 5000 },
  { maand: 'Aug', zendingen: 5200 },
  { maand: 'Sep', zendingen: 5400 },
  { maand: 'Okt', zendingen: 5600 },
  { maand: 'Nov', zendingen: 5800 },
  { maand: 'Dec', zendingen: 6000 },
];

const statOptions = [
  {
    key: 'totaalKlanten',
    label: 'Totaal klanten',
    value: mockStats.totaalKlanten,
    graph: (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={klantenData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="maand" stroke="#c7d2fe" />
          <YAxis stroke="#c7d2fe" />
          <Tooltip />
          <Bar dataKey="klanten" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  {
    key: 'zendingenVandaag',
    label: 'Zendingen vandaag',
    value: mockStats.zendingenVandaag,
    graph: (
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={zendingenData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dag" stroke="#c7d2fe" />
          <YAxis stroke="#c7d2fe" />
          <Tooltip />
          <Line type="monotone" dataKey="aantal" stroke="#fbbf24" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    ),
  },
  {
    key: 'maandZendingen',
    label: 'Maandelijkse zendingen',
    value: mockStats.maandZendingen,
    graph: (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={maandZendingenData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="maand" stroke="#c7d2fe" />
          <YAxis stroke="#c7d2fe" />
          <Tooltip />
          <Bar dataKey="zendingen" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  {
    key: 'jaarOmzet',
    label: 'Jaarlijkse omzet',
    value: `€${mockStats.jaarOmzet}`,
    graph: (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={omzetData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="maand" stroke="#c7d2fe" />
          <YAxis stroke="#c7d2fe" />
          <Tooltip />
          <Bar dataKey="omzet" fill="#f59e42" />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
];

const Stats = () => {
  const [selected, setSelected] = useState('jaarOmzet');

  const selectedStat = statOptions.find(opt => opt.key === selected);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white mb-4">Statistieken</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            className={`bg-indigo-900 rounded-lg p-6 text-left transition border-2 ${
              selected === opt.key
                ? 'border-yellow-400 shadow-lg'
                : 'border-transparent hover:border-indigo-400'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <p className="text-gray-300 mb-2">{opt.label}</p>
            <h2 className="text-3xl font-bold text-white">{opt.value}</h2>
          </button>
        ))}
      </div>

      <div className="bg-indigo-900 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">{selectedStat?.label} grafiek</h3>
        {selectedStat?.graph}
      </div>
    </div>
  );
};

export default Stats;