import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Search, Filter, Plus, Truck, MapPin, Users, X, Map as MapIcon } from 'lucide-react';

export default function AdminTransport() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newRoute, setNewRoute] = useState({
    routeName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    capacity: 0,
    stops: []
  });

  const [stopInput, setStopInput] = useState({ stopName: '', time: '', fee: 0 });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/transport/routes');
      const data = await res.json();
      if (data.data) {
        setRoutes(data.data.reverse());
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = () => {
    if (stopInput.stopName && stopInput.time) {
      setNewRoute({
        ...newRoute,
        stops: [...newRoute.stops, stopInput]
      });
      setStopInput({ stopName: '', time: '', fee: 0 });
    }
  };

  const handleRemoveStop = (idx) => {
    const updatedStops = newRoute.stops.filter((_, i) => i !== idx);
    setNewRoute({ ...newRoute, stops: updatedStops });
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/transport/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoute)
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewRoute({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', capacity: 0, stops: [] });
        fetchRoutes();
      }
    } catch (error) {
      console.error('Error adding route:', error);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Delete this transport route permanently?')) {
      try {
        await fetch(`http://localhost:5000/api/transport/routes/${id}`, { method: 'DELETE' });
        fetchRoutes();
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
  };

  const metrics = {
    totalRoutes: routes.length,
    totalFleet: routes.filter((r, i, self) => self.findIndex(t => t.vehicleNumber === r.vehicleNumber) === i).length,
    totalCapacity: routes.reduce((sum, r) => sum + (r.capacity || 0), 0),
    activeStops: routes.reduce((sum, r) => sum + (r.stops?.length || 0), 0)
  };

  return (
    <Layout breadcrumbs={['Administration', 'Transport & Routes']}>
      <main className="p-8 max-w-[1600px] mx-auto w-full flex flex-col h-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Transport & Bus Routes</h1>
            <p className="text-textSecondary text-sm">Manage school transport fleet, bus tracking, and route assignments.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setIsAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Add New Route
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Active Routes" value={metrics.totalRoutes} icon={<Map className="w-5 h-5 text-primary-400" />} color="primary-500" />
          <MetricCard title="Fleet Size" value={metrics.totalFleet} icon={<Truck className="w-5 h-5 text-emerald-400" />} color="emerald-500" />
          <MetricCard title="Total Capacity" value={metrics.totalCapacity} icon={<Users className="w-5 h-5 text-secondary" />} color="secondary" />
          <MetricCard title="Pickup Stops" value={metrics.activeStops} icon={<MapPin className="w-5 h-5 text-warning" />} color="warning" />
        </div>

        <div className="glass-card flex flex-col flex-1 border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-background">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
              <input type="text" placeholder="Search routes or vehicles..." className="input-field pl-10 border-white/10 bg-surfaceSolid/50 text-sm" />
            </div>
            <button className="flex items-center text-sm font-bold text-textSecondary hover:text-white transition-colors p-2 bg-white/5 rounded-lg border border-white/10">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
              </div>
            ) : routes.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-center">
                <Map className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Routes Configured</h3>
                <p className="text-textSecondary max-w-sm">You have not set up any transport routes. Click Add New Route to begin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {routes.map(route => (
                  <div key={route.id} className="glass-card border border-white/5 hover:border-white/10 transition-colors bg-surfaceSolid/30 flex flex-col relative group">
                    <div className="p-5 border-b border-white/5 flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{route.routeName}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                        </div>
                        <div className="flex items-center text-sm text-textSecondary space-x-4">
                          <span className="flex items-center capitalize"><Truck className="w-4 h-4 mr-1" /> {route.vehicleNumber}</span>
                          <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> Cap: {route.capacity}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteRoute(route.id)} className="text-xs font-bold text-danger bg-danger/10 px-3 py-1 rounded border border-danger/20 hover:bg-danger/20 transition-colors opacity-0 group-hover:opacity-100">Remove</button>
                    </div>
                    <div className="p-5 bg-background/50 flex flex-col space-y-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-xs text-textSecondary block uppercase tracking-wider mb-1">Driver</span>
                          <span className="text-white font-medium">{route.driverName}</span>
                          <span className="text-textSecondary ml-2">({route.driverPhone})</span>
                        </div>
                      </div>
                      {route.stops && route.stops.length > 0 && (
                        <div>
                          <p className="text-xs text-textSecondary uppercase tracking-wider mb-3 font-bold">Route Waypoints</p>
                          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                            {route.stops.map((stop, idx) => (
                              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-surfaceSolid text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded border border-white/5 bg-white/5 backdrop-blur-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-white text-sm">{stop.stopName}</span>
                                    <span className="font-mono text-xs text-primary-400 font-bold">{stop.time}</span>
                                  </div>
                                  <div className="text-xs text-textSecondary uppercase tracking-wider">Fee: ${stop.fee}/mo</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Route Modal */}
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-background">
                  <h2 className="text-xl font-bold text-white">Config Transport Route</h2>
                  <button onClick={() => setIsAddOpen(false)} className="text-textSecondary hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
                  <form id="addRouteForm" onSubmit={handleAddRoute} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Route Name (Identifier)</label>
                        <input required type="text" value={newRoute.routeName} onChange={e => setNewRoute({ ...newRoute, routeName: e.target.value })} className="input-field bg-[#0D1117]" placeholder="e.g. Route A - North City" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Vehicle License / ID</label>
                        <input required type="text" value={newRoute.vehicleNumber} onChange={e => setNewRoute({ ...newRoute, vehicleNumber: e.target.value })} className="input-field bg-[#0D1117]" placeholder="e.g. AB-1234 Bus 04" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Driver Name</label>
                        <input required type="text" value={newRoute.driverName} onChange={e => setNewRoute({ ...newRoute, driverName: e.target.value })} className="input-field bg-[#0D1117]" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Driver Phone</label>
                        <input required type="text" value={newRoute.driverPhone} onChange={e => setNewRoute({ ...newRoute, driverPhone: e.target.value })} className="input-field bg-[#0D1117]" placeholder="+1 234 567 890" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Bus Capacity</label>
                        <input required type="number" min="1" value={newRoute.capacity} onChange={e => setNewRoute({ ...newRoute, capacity: e.target.value })} className="input-field bg-[#0D1117]" />
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden mt-6">
                      <div className="bg-surfaceSolid p-4 border-b border-white/10 flex items-center mb-0">
                        <MapIcon className="w-4 h-4 text-primary-400 mr-2" />
                        <span className="font-bold text-white text-sm">Waypoints & Pricing</span>
                      </div>
                      <div className="p-4 bg-background">
                        <div className="flex space-x-3 mb-4">
                          <input type="text" placeholder="Stop Name" value={stopInput.stopName} onChange={e => setStopInput({ ...stopInput, stopName: e.target.value })} className="input-field bg-[#0D1117] flex-[2]" />
                          <input type="time" value={stopInput.time} onChange={e => setStopInput({ ...stopInput, time: e.target.value })} className="input-field bg-[#0D1117] flex-1" />
                          <input type="number" placeholder="Fee ($)" value={stopInput.fee} onChange={e => setStopInput({ ...stopInput, fee: e.target.value })} className="input-field bg-[#0D1117] flex-1" />
                          <button type="button" onClick={handleAddStop} className="btn-secondary whitespace-nowrap">Add Stop</button>
                        </div>

                        {newRoute.stops.length > 0 && (
                          <table className="w-full text-left text-sm text-textSecondary">
                            <thead className="text-xs uppercase bg-white/5 border border-white/5">
                              <tr>
                                <th className="px-4 py-2">Stop Name</th>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Fee</th>
                                <th className="px-4 py-2 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="border border-t-0 border-white/5 divide-y divide-white/5">
                              {newRoute.stops.map((stop, i) => (
                                <tr key={i}>
                                  <td className="px-4 py-2 text-white">{stop.stopName}</td>
                                  <td className="px-4 py-2 font-mono">{stop.time}</td>
                                  <td className="px-4 py-2 font-mono">${stop.fee}</td>
                                  <td className="px-4 py-2">
                                    <button type="button" onClick={() => handleRemoveStop(i)} className="text-danger hover:text-danger/80"><X className="w-4 h-4" /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
                <div className="p-4 border-t border-white/10 flex justify-end space-x-3 bg-background">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" form="addRouteForm" className="btn-primary">Save Route</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-textSecondary">{title}</p>
          <div className={`p-2 rounded-lg bg-${color}/10 border border-${color}/20`}>
            {icon}
          </div>
        </div>
        <h3 className="font-display text-4xl font-bold text-white">{value}</h3>
      </div>
    </motion.div>
  );
}
