import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Task, Appliance } from '../lib/types';
import { Icon } from '../lib/icons';
import { easings } from '../lib/motion';

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    void fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [tasksRes, appliancesRes] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('appliances').select('*').order('created_at', { ascending: false }),
    ]);
    setTasks((tasksRes.data as Task[]) ?? []);
    setAppliances((appliancesRes.data as Appliance[]) ?? []);
    setLoading(false);
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredAppliances = appliances.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <Screen>
        <Header title="Search" onBack={() => navigate(-1)} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Search" onBack={() => navigate(-1)} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        className="p-4"
      >
        <Input
          label="Search tasks and appliances"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. HVAC filter, fridge..."
          autoFocus
        />
        {query.trim() === '' && (
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-sm">Type to search your tasks and appliances.</p>
          </div>
        )}
        {query.trim() !== '' && filteredTasks.length === 0 && filteredAppliances.length === 0 && (
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-sm">No results found for "{query}"</p>
          </div>
        )}
        {filteredTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tasks</h3>
            {filteredTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate(`/detail/${t.id}`)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon name="task" size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-500">
                      Due {new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <Icon name="chevronRight" size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        )}
        {filteredAppliances.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Appliances</h3>
            {filteredAppliances.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => navigate(`/appliance/${a.id}`)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon name="appliance" size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-500">{a.category}</div>
                  </div>
                </div>
                <Icon name="chevronRight" size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </Screen>
  );
}