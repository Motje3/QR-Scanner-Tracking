import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { API_BASE_URL } from '../config/env';
import LoadingSpinner from '../components/LoadingSpinner';

const formatEuro = (value: number | null) =>
  value != null ? `€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';

const Stats = () => {
  const [stats, setStats] = useState<any>(null);
  const [selected, setSelected] = useState('jaarOmzet');
  const [error, setError] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(() => {
    return localStorage.getItem('statsLoaded') === 'true' ? false : true;
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/overview`)
      .then(res => res.json())
      .then(setStats)
      .catch(err => {
        setError('Kan statistieken niet laden');
        console.error('Error fetching stats:', err);
      });
  }, []);

  useEffect(() => {
    if (firstLoad) {
      const timer = setTimeout(() => {
        setFirstLoad(false);
        localStorage.setItem('statsLoaded', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [firstLoad]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (firstLoad) return <LoadingSpinner />;
  if (!stats) return <LoadingSpinner />;

  const statOptions = [
    {
      key: 'totaalZendingenJaar',
      label: 'Totaal zendingen dit jaar',
      value: stats.totaalZendingenJaar,
      graph: (
        <ResponsiveContainer width="100%" height={800}>
          <BarChart data={stats.maandZendingen}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="maand" stroke="#c7d2fe" />
            <YAxis stroke="#c7d2fe" />
            <Tooltip />
            <Bar dataKey="zendingen" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: 'zendingenVandaag',
      label: 'Zendingen vandaag',
      value: stats.zendingenVandaag,
      graph: (
        <ResponsiveContainer width="100%" height={800}>
          <BarChart data={[{ maand: 'Vandaag', zendingen: stats.zendingenVandaag }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="maand" stroke="#c7d2fe" />
            <YAxis stroke="#c7d2fe" />
            <Tooltip />
            <Bar dataKey="zendingen" fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      key: 'maandZendingen',
      label: 'Maandelijkse zendingen',
      value: (() => {
        const maand = new Date().toLocaleString('en-US', { month: 'short' });
        const found = stats.maandZendingen.find((m: any) => m.maand === maand);
        return found ? found.zendingen : 0;
      })(),
      graph: (
        <ResponsiveContainer width="100%" height={800}>
          <BarChart data={stats.maandZendingen}>
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
      value: stats.jaarOmzet,
      graph: (
        <ResponsiveContainer width="100%" height={800}>
          <BarChart data={stats.omzetPerMaand}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="maand" stroke="#c7d2fe" />
            <YAxis stroke="#c7d2fe" tickFormatter={formatEuro} />
            <Tooltip formatter={(value: number) => formatEuro(value)} />
            <Bar dataKey="omzet" fill="#f59e42" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

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
            <h2 className="text-3xl font-bold text-white">
              {opt.key === 'jaarOmzet'
                ? formatEuro(opt.value)
                : opt.value}
            </h2>
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