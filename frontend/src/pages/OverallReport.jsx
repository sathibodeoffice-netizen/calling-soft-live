import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Fixed employee configuration exactly matching Google Sheet
const employeeConfig = [
  { name: 'Nayem', cols: ['Edit', 'Review', 'Call', 'Report', 'InCall', 'Email', 'OT', 'HB Call'] },
  { name: 'Ahsan', cols: ['Email', 'Call', 'Report', 'InCall'] },
  { name: 'Sathib', cols: ['Call', 'Edit', 'CR Call', 'CR Review', 'Review', 'OT'] },
  { name: 'Mamun', cols: ['Email', 'FB', 'CR', 'Edit', 'Review', 'OT', 'HB Email', 'Call'] },
  { name: 'Towfiq', cols: ['Email', 'HB Email', 'Edit', 'Review', 'CR Review', 'OT'] },
  { name: 'Suja', cols: ['Review', 'CR Review', 'OT', 'Edit'] },
  { name: 'Tareq', cols: ['Call', 'Edit', 'CR Call', 'CR Review', 'Review', 'OT'] },
  { name: 'Rokib', cols: ['Call', 'Edit', 'CR Call', 'MID Review', 'In Call', 'Review', 'OD & HB OT', 'HB Review', 'HB Call'] },
  { name: 'Roky', cols: ['Call', 'Edit', 'Review', 'Report', 'CR Review', 'In Call', 'OT', 'HB Call'] },
  { name: 'Masum', cols: ['Call', 'Edit', 'CR Call', 'Report', 'Review', 'In Call', 'OT'] },
  { name: 'Mahmud', cols: ['Call', 'Edit', 'CR Call', 'In Call', 'OT', 'HB Review', 'HB Call'] },
  { name: 'Hasan', cols: ['Call', 'OT', 'Edit', 'Review'] },
  { name: 'Tuba', cols: ['Call', 'HB Call', 'OT', 'Review', 'Edit'] },
  { name: 'Anika', cols: ['Edit'] },
];

const totalCols = [
  'Approved', 'Edit Approved', 'Edit required', 'Not Approved', 'CR Not Approved', 'All Check', 'Remarks'
];

function OverallReport({ token }) {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both automated calling data and manual overrides
      const [callingRes, manualRes] = await Promise.all([
        axios.get('/api/calling', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/report/manual', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      processData(callingRes.data, manualRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch report data', error);
      setLoading(false);
    }
  };

  const processData = (callingData, manualData) => {
    const dataMap = {}; // dataMap[dateStr][employee][col] = value

    // Helper to init date
    const initDate = (dStr) => {
      if (!dataMap[dStr]) {
        dataMap[dStr] = {
          Total: { 'Approved': 0, 'Edit required': 0, 'Not Approved': 0, 'Edit Approved': 0, 'CR Not Approved': 0, 'All Check': 0, 'Remarks': 0 }
        };
        employeeConfig.forEach(emp => {
          dataMap[dStr][emp.name] = {};
          emp.cols.forEach(c => dataMap[dStr][emp.name][c] = 0);
        });
      }
    };

    // 1. Process automated calling data
    callingData.forEach(row => {
      const dStr = row.sheetDate || '10 Feb 26';
      initDate(dStr);

      // Status totals
      if (row.status === 'Approved') dataMap[dStr]['Total']['Approved']++;
      else if (row.status === 'Not Approved') dataMap[dStr]['Total']['Not Approved']++;
      else if (row.status === 'Edit required') dataMap[dStr]['Total']['Edit required']++;

      // Count actions
      const processAction = (empName, actionStr) => {
        if (!empName) return;
        const name = empName.trim();
        if (dataMap[dStr][name] && dataMap[dStr][name][actionStr] !== undefined) {
          dataMap[dStr][name][actionStr]++;
        }
      };

      processAction(row.review, 'Review');
      processAction(row.edit, 'Edit');
      processAction(row.call, 'Call');
      processAction(row.callingOT, 'OT');
      processAction(row.editOT, 'OT');
      processAction(row.reviewOT, 'OT');
    });

    // 2. Process manual overrides (they replace auto values)
    manualData.forEach(entry => {
      initDate(entry.dateStr);
      if (!dataMap[entry.dateStr][entry.employee]) {
        dataMap[entry.dateStr][entry.employee] = {};
      }
      dataMap[entry.dateStr][entry.employee][entry.field] = entry.value;
    });

    // Ensure we have at least one empty date if no data exists
    if (Object.keys(dataMap).length === 0) {
      initDate('10 Feb 26');
    }

    setReportData(dataMap);
  };

  const handleManualEntry = async (dateStr, employee, field, value) => {
    // Optimistic UI update
    const numVal = parseInt(value) || 0;
    setReportData(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [employee]: {
          ...prev[dateStr][employee],
          [field]: numVal
        }
      }
    }));

    try {
      await axios.post('/api/report/manual', {
        dateStr, employee, field, value: numVal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to save manual entry', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading Report...</div>;

  const dates = Object.keys(reportData).sort((a,b) => new Date(b) - new Date(a));

  return (
  return (
    <div className="flex flex-col h-[90vh] p-4 bg-slate-50 relative">
      <div className="flex justify-between items-center mb-4 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">Overall Report</h2>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto">
        <table className="min-w-max w-full table-auto text-sm border-collapse select-none">
          <thead className="sticky top-0 z-20 glass-header">
            <tr>
              <th rowSpan="2" className="border-b border-r border-slate-200 p-3 min-w-[120px] bg-slate-100 text-slate-800 text-center font-extrabold uppercase tracking-wider">Date</th>
              {employeeConfig.map(emp => (
                <th key={emp.name} colSpan={emp.cols.length} className="border-b border-r border-slate-200 p-2 bg-indigo-50 text-indigo-800 text-center font-extrabold uppercase tracking-wider">
                  {emp.name}
                </th>
              ))}
              <th colSpan={totalCols.length} className="border-b border-slate-200 p-2 bg-emerald-50 text-emerald-800 text-center font-extrabold uppercase tracking-wider">
                Total
              </th>
            </tr>
            <tr>
              {employeeConfig.map(emp => (
                <React.Fragment key={emp.name + '-cols'}>
                  {emp.cols.map(c => (
                    <th key={emp.name + c} className="border-b border-r border-slate-200 p-2 min-w-[80px] bg-slate-50 text-slate-600 font-bold text-center text-xs">
                      {c}
                    </th>
                  ))}
                </React.Fragment>
              ))}
              {totalCols.map(c => (
                <th key={'Total-' + c} className="border-b border-r border-slate-200 p-2 min-w-[90px] bg-fuchsia-50 text-fuchsia-800 font-bold text-center text-xs">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map(date => (
              <tr key={date} className="group hover:bg-slate-50 border-b border-slate-100 transition-colors">
                <td className="border-r border-slate-100 p-3 font-extrabold whitespace-nowrap bg-slate-50 group-hover:bg-slate-100 transition-colors text-slate-700">{date}</td>
                {employeeConfig.map(emp => (
                  <React.Fragment key={date + emp.name}>
                    {emp.cols.map(c => (
                      <td key={`${date}-${emp.name}-${c}`} className="border-r border-slate-100 p-0 text-center">
                        <input 
                          type="text" 
                          className="w-full h-full p-2 outline-none text-center bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-400 font-semibold text-slate-600"
                          value={reportData[date][emp.name]?.[c] || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setReportData(prev => ({
                              ...prev,
                              [date]: { ...prev[date], [emp.name]: { ...prev[date][emp.name], [c]: val } }
                            }));
                          }}
                          onBlur={(e) => handleManualEntry(date, emp.name, c, e.target.value)}
                        />
                      </td>
                    ))}
                  </React.Fragment>
                ))}
                {totalCols.map(c => (
                  <td key={`${date}-Total-${c}`} className="border-r border-slate-100 p-0 text-center bg-fuchsia-50/30">
                    <input 
                      type="text" 
                      className="w-full h-full p-2 outline-none text-center font-bold text-fuchsia-700 bg-transparent focus:bg-white focus:ring-2 focus:ring-fuchsia-400"
                      value={reportData[date]['Total']?.[c] || ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setReportData(prev => ({
                          ...prev,
                          [date]: { ...prev[date], ['Total']: { ...prev[date]['Total'], [c]: val } }
                        }));
                      }}
                      onBlur={(e) => handleManualEntry(date, 'Total', c, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {/* Render empty rows to simulate a full spreadsheet grid */}
            {!loading && dates.length < 20 && Array.from({ length: 20 - dates.length }).map((_, i) => (
              <tr key={`empty-report-${i}`} className="border-b border-slate-50">
                <td className="border-r border-slate-50 p-2 h-10 bg-slate-50/50"></td>
                {employeeConfig.map(emp => (
                  <React.Fragment key={`empty-report-${i}-${emp.name}`}>
                    {emp.cols.map(c => (
                      <td key={`empty-report-${i}-${emp.name}-${c}`} className="border-r border-slate-50 p-0 h-10"></td>
                    ))}
                  </React.Fragment>
                ))}
                {totalCols.map(c => (
                  <td key={`empty-report-${i}-Total-${c}`} className="border-r border-slate-50 p-0 h-10 bg-fuchsia-50/20"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OverallReport;
