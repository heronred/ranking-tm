import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';
import { motion } from 'motion/react';

const data = [
  { name: 'Vitórias', value: 12, color: '#F97316' },
  { name: 'Derrotas', value: 4, color: '#64748B' },
];

const perfData = [
  { day: 'Seg', rate: 60 },
  { day: 'Ter', rate: 75 },
  { day: 'Qua', rate: 45 },
  { day: 'Qui', rate: 80 },
  { day: 'Sex', rate: 90 },
];

export const Stats: React.FC = () => {
  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Estatísticas</h1>
        <p className="text-slate-500 font-medium font-mono uppercase text-xs tracking-widest">Análise de Performance Individual</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Jogos', value: '16', icon: Activity, bg: 'bg-blue-500' },
          { label: 'Taxa de Vitória', value: '75%', icon: Target, bg: 'bg-orange-500' },
          { label: 'Média de Pontos', value: '18.4', icon: Users, bg: 'bg-emerald-500' },
          { label: 'Tendência', value: '+12%', icon: TrendingUp, bg: 'bg-indigo-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-${stat.bg.split('-')[1]}-500/20`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Distribuição de Resultados</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Performance por Dia</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none'}} />
                <Bar dataKey="rate" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 p-12 rounded-[40px] text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Relatório de IA</h2>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            Com base no seu histórico recente, você apresenta uma melhora significativa no saque lateral. 
            Sua taxa de vitória contra jogadores da categoria "Federados" subiu 15% nas últimas 2 semanas.
          </p>
          <button className="bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
            Exportar dados detalhados
          </button>
        </div>
        <div className="absolute right-[-100px] top-[-50px] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};
