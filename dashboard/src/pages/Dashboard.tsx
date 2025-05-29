import { Mail, Phone, Users, DollarSign } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welkom bij je dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Totaal Klanten Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Totaal klanten</p>
              <h2 className="text-3xl font-bold text-white">5251</h2>
              <p className="text-green-400 mt-2">+14%</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <Mail className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Sinds vorige maand</p>
        </div>

        {/* Zendingen Vandaag Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Zendingen vandaag</p>
              <h2 className="text-3xl font-bold text-white">7916</h2>
              <p className="text-green-400 mt-2">+21%</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <Phone className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Sinds vorige maand</p>
        </div>

        {/* Maandelijkse Zendingen Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Maandelijkse zendingen</p>
              <h2 className="text-3xl font-bold text-white">59525</h2>
              <p className="text-green-400 mt-2">+5%</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <Users className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Sinds vorige maand</p>
        </div>

        {/* Jaarlijkse Verkoop Kaart */}
        <div className="bg-indigo-900 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 mb-2">Jaarlijkse verkoop</p>
              <h2 className="text-3xl font-bold text-white">65152</h2>
              <p className="text-green-400 mt-2">+43%</p>
            </div>
            <div className="p-2 bg-indigo-800 rounded-md">
              <DollarSign className="text-yellow-200" size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">Sinds vorige maand</p>
        </div>
      </div>

      {/* Grafiek Placeholder */}
      <div className="bg-indigo-900 rounded-lg p-6 h-80 relative">
        <h3 className="text-white font-semibold mb-4">Verkooptrends</h3>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Grafiek wordt hier geïmplementeerd</p>
        </div>
      </div>

      {/* Tabel Placeholder */}
      <div className="bg-indigo-900 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Recente transacties</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-indigo-800">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Gebruikers-ID</th>
              <th className="py-3 px-4">Aangemaakt op</th>
              <th className="py-3 px-4">Aantal producten</th>
              <th className="py-3 px-4">Kosten</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="border-b border-indigo-800">
                <td className="py-3 px-4">637010f74f03239c72c0001b{row}</td>
                <td className="py-3 px-4">637010cf103233{row}c0000124</td>
                <td className="py-3 px-4">2022-11-29T01:09:39.558Z</td>
                <td className="py-3 px-4">{row}</td>
                <td className="py-3 px-4">€{(row * 500 + 123.45).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4 text-gray-400">
          <div>Rijen per pagina: 10</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-indigo-800 rounded">Vorige</button>
            <button className="px-3 py-1 border border-indigo-800 rounded">Volgende</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
