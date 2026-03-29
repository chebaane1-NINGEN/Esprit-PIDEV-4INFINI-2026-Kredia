import React, { useState, useEffect } from 'react';
import { UserResponseDTO, AgentPerformanceDTO } from '../../types/user.types';
import { userApi } from '../../api/userApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

type EnhancedAgent = UserResponseDTO & {
  performance?: AgentPerformanceDTO | null;
  error?: string;
};

const ReportingPerformance: React.FC = () => {
  const [agents, setAgents] = useState<EnhancedAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        // Step 1: Fetch agents
        const res = await userApi.getAdminAgents({ page: 0, size: 50 });
        const employeeList = res.content || [];
        
        // Step 2: Fetch performance metrics for each agent concurrently
        const enhancedList = await Promise.all(employeeList.map(async (agent) => {
          try {
            const perf = await userApi.getAgentPerformance(agent.id);
            return { ...agent, performance: perf };
          } catch (err: any) {
            return { ...agent, performance: null, error: 'No data' };
          }
        }));

        setAgents(enhancedList);
      } catch (err) {
        console.error('Error loading reports', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  // Global KPI Calculations based on fetched agents
  const validPerformances = agents.filter(a => a.performance);
  const totalLoans = validPerformances.reduce((acc, curr) => acc + (curr.performance?.totalLoansProcessed || 0), 0);
  const avgSatisfaction = validPerformances.length > 0 
    ? (validPerformances.reduce((acc, curr) => acc + (curr.performance?.clientSatisfactionScore || 0), 0) / validPerformances.length).toFixed(1)
    : 0;

  // Chart Mapping
  const chartData = agents.map(a => ({
    name: a.firstName,
    loans: a.performance?.totalLoansProcessed || 0,
    investments: a.performance?.totalInvestmentsAdvised || 0,
    clients: a.performance?.totalClientsManaged || 0
  })).filter(a => a.loans > 0 || a.clients > 0);

  return (
    <div className="reporting-performance wow fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Agent Performance & Reporting</h2>
          <p className="text-muted">Global team KPIs and individual employee productivity metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Total Tracked Agents</p>
          <div className="value mt-1 text-3xl font-bold">{agents.length}</div>
        </div>
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Global Processed Loans</p>
          <div className="value mt-1 text-3xl font-bold text-primary">{totalLoans}</div>
        </div>
        <div className="stat-card">
          <p className="text-muted text-sm font-medium">Team Avg. CSAT</p>
          <div className="value mt-1 text-3xl font-bold text-success">{avgSatisfaction} / 5.0</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="section-card mb-6">
          <div className="card-header border-b">
            <h3>Team Processing Volume</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="loans" name="Loans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="investments" name="Investments" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card p-0">
        <div className="table-responsive">
          <table className="table m-0">
            <thead className="bg-light">
              <tr>
                <th>Agent</th>
                <th>Performance Rating</th>
                <th>Clients Managed</th>
                <th>Loans Processed</th>
                <th>Investments</th>
                <th>Avg. Response</th>
                <th>CSAT Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">
                  <div className="spinner inline-block"></div>
                </td></tr>
              ) : agents.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted">No agents found.</td></tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent.id}>
                    <td>
                      <div className="font-medium">{agent.firstName} {agent.lastName}</div>
                      <div className="text-xs text-muted">ID: {agent.id}</div>
                    </td>
                    <td>
                      {agent.performance ? (
                        <span className={`badge ${agent.performance.performanceRating === 'EXCELLENT' ? 'bg-success' : agent.performance.performanceRating === 'NEEDS_IMPROVEMENT' ? 'bg-danger' : 'bg-primary'}`}>
                          {agent.performance.performanceRating}
                        </span>
                      ) : (
                        <span className="text-muted italic text-sm">{agent.error || 'N/A'}</span>
                      )}
                    </td>
                    <td>{agent.performance?.totalClientsManaged ?? '-'}</td>
                    <td>{agent.performance?.totalLoansProcessed ?? '-'}</td>
                    <td>{agent.performance?.totalInvestmentsAdvised ?? '-'}</td>
                    <td>{agent.performance ? `${agent.performance.averageResponseTimeHrs} hrs` : '-'}</td>
                    <td>
                      {agent.performance?.clientSatisfactionScore ? (
                        <div className="flex items-center gap-1">
                          <span className="text-warning">★</span>
                          <strong>{agent.performance.clientSatisfactionScore}</strong>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportingPerformance;
