import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Undo, Redo, Printer, PaintRoller, 
  Bold, Italic, Strikethrough, Baseline, PaintBucket, 
  Grid, AlignLeft, AlignCenter, AlignRight 
} from 'lucide-react';

function Dashboard({ token }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetDate, setSheetDate] = useState('');
  const [availableSheets, setAvailableSheets] = useState([]);
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [newPageDate, setNewPageDate] = useState('');
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', color: '#32cd32' });
  
  const [activeCell, setActiveCell] = useState({ rowIndex: null, field: null });
  const [activeCellValue, setActiveCellValue] = useState('');

  useEffect(() => {
    fetchAvailableSheets();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (sheetDate) {
      fetchCallingData();
    }
  }, [sheetDate]);

  const fetchAvailableSheets = async () => {
    try {
      const res = await axios.get('/api/calling/sheets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.length > 0) {
        setAvailableSheets(res.data);
        if (!sheetDate) setSheetDate(res.data[0]);
      } else {
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ');
        setAvailableSheets([today]);
        setSheetDate(today);
      }
    } catch (err) {
      console.error('Failed to fetch sheets', err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get('/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const fetchCallingData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/calling?sheetDate=${sheetDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoading(false);
    }
  };

  const handleAddRow = async () => {
    try {
      const res = await axios.post('/api/calling', {
        email: '', name: '', mobileNo: '', relation: '', errorCode: '', remarks: '', 
        status: '', review: '', edit: '', call: '', callingOT: '', editOT: '', reviewOT: '', 
        editOverview: '', remarksFromCalling: '', remarksFromReview: '', 
        reviewTime: '', editTime: '', callTime: '', sheetDate: sheetDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData([res.data, ...data]);
    } catch (error) {
      console.error('Error adding row', error);
    }
  };

  const handleBlur = async (id, field, value) => {
    if (id.length < 10) return; 
    try {
      await axios.put(`/api/calling/${id}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating data', error);
    }
  };

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
    
    if (activeCell.rowIndex === index && activeCell.field === field) {
      setActiveCellValue(value);
    }
  };

  const handleFocus = (rowIndex, field, value) => {
    setActiveCell({ rowIndex, field });
    setActiveCellValue(value || '');
  };

  const handleFormulaBarChange = (e) => {
    const val = e.target.value;
    setActiveCellValue(val);
    if (activeCell.rowIndex !== null && activeCell.field) {
      handleChange(activeCell.rowIndex, activeCell.field, val);
    }
  };

  const handleFormulaBarBlur = () => {
    if (activeCell.rowIndex !== null && activeCell.field) {
      const row = data[activeCell.rowIndex];
      if (row && row._id) {
        handleBlur(row._id, activeCell.field, activeCellValue);
      }
    }
  };

  const handleFormat = async (formatType, value) => {
    if (activeCell.rowIndex === null || !activeCell.field) return;
    const { rowIndex, field } = activeCell;
    const row = data[rowIndex];
    
    const currentStyles = row.styles || {};
    const fieldStyles = currentStyles[field] || {};
    
    let newValue = value;
    if (['bold', 'italic', 'strikethrough'].includes(formatType)) {
      newValue = !fieldStyles[formatType];
    }

    const updatedFieldStyles = { ...fieldStyles, [formatType]: newValue };
    const updatedStyles = { ...currentStyles, [field]: updatedFieldStyles };
    
    const newData = [...data];
    newData[rowIndex] = { ...row, styles: updatedStyles };
    setData(newData);

    if (row._id) {
      try {
        await axios.put(`/api/calling/${row._id}`, { styles: updatedStyles }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to save styles', error);
      }
    }
  };

  const getInlineStyle = (row, field) => {
    const styles = row.styles?.[field] || {};
    const inline = {
      fontWeight: styles.bold ? 'bold' : 'normal',
      fontStyle: styles.italic ? 'italic' : 'normal',
      textDecoration: styles.strikethrough ? 'line-through' : 'none',
      textAlign: styles.align || 'left',
    };
    if (styles.color) inline.color = styles.color;
    if (styles.backgroundColor) inline.backgroundColor = styles.backgroundColor;
    return inline;
  };

  const COLUMNS = [
    'email', 'name', 'mobileNo', 'relation', 'errorCode', 'remarks', 'status',
    'review', 'edit', 'call', 'callingOT', 'editOT', 'reviewOT',
    'remarksFromCalling', 'remarksFromReview', 'reviewTime', 'editTime', 'callTime'
  ];

  const handleKeyDown = (e, rowIndex, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextRow = e.shiftKey ? rowIndex - 1 : rowIndex + 1;
      const nextCell = document.getElementById(`cell-${nextRow}-${field}`);
      if (nextCell) nextCell.focus();
    } else if (e.key === 'ArrowUp') {
      if (e.target.tagName !== 'SELECT') {
        e.preventDefault();
        const nextCell = document.getElementById(`cell-${rowIndex - 1}-${field}`);
        if (nextCell) nextCell.focus();
      }
    } else if (e.key === 'ArrowDown') {
      if (e.target.tagName !== 'SELECT') {
        e.preventDefault();
        const nextCell = document.getElementById(`cell-${rowIndex + 1}-${field}`);
        if (nextCell) nextCell.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (e.target.tagName !== 'SELECT' && e.target.selectionStart === 0) {
        const colIndex = COLUMNS.indexOf(field);
        if (colIndex > 0) {
          const nextCell = document.getElementById(`cell-${rowIndex}-${COLUMNS[colIndex - 1]}`);
          if (nextCell) nextCell.focus();
        }
      }
    } else if (e.key === 'ArrowRight') {
      if (e.target.tagName !== 'SELECT' && e.target.selectionEnd === e.target.value?.length) {
        const colIndex = COLUMNS.indexOf(field);
        if (colIndex < COLUMNS.length - 1) {
          const nextCell = document.getElementById(`cell-${rowIndex}-${COLUMNS[colIndex + 1]}`);
          if (nextCell) nextCell.focus();
        }
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'Edit Approved': return 'bg-green-500 text-black border-green-600 font-medium';
      case 'Not Approved': 
      case 'Not Approve':
      case 'CR Not Approved': return 'bg-red-500 text-black border-red-600 font-medium';
      case 'Edit required': return 'bg-red-200 text-red-800 border-red-300';
      case 'Waiting for call': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Call Once': return 'bg-blue-200 text-blue-800 border-blue-300';
      case 'Pending': return 'bg-yellow-200 text-yellow-800 border-yellow-300';
      case 'Delete':
      case 'Delet': return 'bg-gray-300 text-gray-800 border-gray-400';
      case 'Not Submitted': return 'bg-gray-100 text-gray-600 border-gray-300';
      default: return 'bg-white text-gray-900 border-gray-300';
    }
  };

  const getMemberColor = (name) => {
    if (!name) return 'transparent';
    const member = teamMembers.find(m => m.name === name);
    return member ? member.color : 'transparent';
  };

  const handleAddNewPage = () => {
    if (newPageDate.trim()) {
      if (!availableSheets.includes(newPageDate)) {
        setAvailableSheets([newPageDate, ...availableSheets]);
      }
      setSheetDate(newPageDate);
      setShowNewPageInput(false);
      setNewPageDate('');
    }
  };

  const handleAddMember = async () => {
    if (newMember.name.trim()) {
      try {
        const res = await axios.post('/api/members', newMember, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh members
        fetchTeamMembers();
        setShowMemberModal(false);
        setNewMember({ name: '', color: '#32cd32' });
      } catch (err) {
        console.error('Failed to add member', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[95vh] p-4 bg-slate-50 relative">
      {/* Member Modal */}
      {showMemberModal && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-4 min-w-[300px] transform transition-all scale-100">
            <h3 className="font-extrabold text-xl text-slate-800">Add New Member</h3>
            <input 
              type="text" 
              placeholder="Name" 
              className="border border-gray-300 p-1.5 rounded outline-none"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Color:</label>
              <input 
                type="color" 
                value={newMember.color}
                onChange={(e) => setNewMember({...newMember, color: e.target.value})}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all" onClick={handleAddMember}>Add Member</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">Calling Sheet</h2>
        <div className="flex gap-3 items-center">
          <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Sheet:</label>
          <select 
            value={sheetDate}
            onChange={(e) => setSheetDate(e.target.value)}
            className="border-2 border-slate-200 p-2 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold min-w-[120px] bg-slate-50 cursor-pointer transition-all"
          >
            {availableSheets.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          {showNewPageInput ? (
            <div className="flex items-center gap-2 bg-slate-50 border-2 border-indigo-200 rounded-xl p-1 ml-1 transition-all">
              <input 
                type="text" placeholder="e.g. 15 Feb 26" value={newPageDate}
                onChange={(e) => setNewPageDate(e.target.value)}
                className="p-1 pl-2 outline-none w-[100px] text-sm bg-transparent font-semibold"
              />
              <button onClick={handleAddNewPage} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md transition-colors">OK</button>
              <button onClick={() => setShowNewPageInput(false)} className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">X</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowNewPageInput(true)}
              className="bg-slate-100 hover:bg-slate-200 text-indigo-700 font-bold py-2 px-4 rounded-xl shadow-sm border border-slate-200 text-sm ml-1 transition-all flex items-center gap-1"
            >
              + Add Page
            </button>
          )}
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          <button 
            onClick={handleAddRow}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-md shadow-blue-500/20 text-sm ml-1 transition-all transform hover:-translate-y-0.5"
          >
            + Add Row
          </button>
          <button 
            onClick={() => setShowMemberModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2 px-4 rounded-xl shadow-md shadow-emerald-500/20 text-sm ml-1 transition-all transform hover:-translate-y-0.5"
          >
            + Add Member
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
        {/* Google Sheets Toolbar */}
        <div className="flex flex-col border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
          <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><Search size={18} /></button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><Undo size={18} /></button>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><Redo size={18} /></button>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all" onClick={() => window.print()}><Printer size={18} /></button>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><PaintRoller size={18} /></button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 flex items-center gap-1 text-sm font-semibold transition-all">100%</button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 flex items-center gap-1 text-sm font-sans font-semibold transition-all">Inter</button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 flex items-center gap-1 text-sm font-semibold transition-all">10</button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            
            {/* Working Formatting Tools */}
            <button 
              className={`p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all ${activeCell.rowIndex !== null && data[activeCell.rowIndex]?.styles?.[activeCell.field]?.bold ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'text-slate-700'}`} 
              onClick={() => handleFormat('bold')} title="Bold">
              <Bold size={18} />
            </button>
            <button 
              className={`p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all ${activeCell.rowIndex !== null && data[activeCell.rowIndex]?.styles?.[activeCell.field]?.italic ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'text-slate-700'}`} 
              onClick={() => handleFormat('italic')} title="Italic">
              <Italic size={18} />
            </button>
            <button 
              className={`p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all ${activeCell.rowIndex !== null && data[activeCell.rowIndex]?.styles?.[activeCell.field]?.strikethrough ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'text-slate-700'}`} 
              onClick={() => handleFormat('strikethrough')} title="Strikethrough">
              <Strikethrough size={18} />
            </button>
            <div className="relative group flex items-center">
               <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-700 transition-all" title="Text Color"><Baseline size={18} /></button>
               <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={(e) => handleFormat('color', e.target.value)} />
            </div>
            <div className="relative group flex items-center">
               <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-700 transition-all" title="Fill Color"><PaintBucket size={18} /></button>
               <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={(e) => handleFormat('backgroundColor', e.target.value)} />
            </div>
            
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><Grid size={18} /></button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all" onClick={() => handleFormat('align', 'left')}><AlignLeft size={18} /></button>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all" onClick={() => handleFormat('align', 'center')}><AlignCenter size={18} /></button>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all" onClick={() => handleFormat('align', 'right')}><AlignRight size={18} /></button>
          </div>

          {/* Formula Bar */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white border-t border-slate-200 text-sm shadow-inner">
            <div className="text-slate-400 italic font-serif font-bold pr-3 border-r border-slate-200 select-none">fx</div>
            <input 
              type="text" 
              className="flex-1 outline-none font-mono text-sm bg-transparent text-slate-700 placeholder-slate-400" 
              value={activeCellValue}
              onChange={handleFormulaBarChange}
              onBlur={handleFormulaBarBlur}
              placeholder={activeCell.rowIndex !== null ? `Editing row ${activeCell.rowIndex + 1}, column ${activeCell.field}` : 'Select a cell to edit...'}
            />
          </div>
        </div>

        {/* Spreadsheet Body */}
        <div className="flex-1 bg-white overflow-auto">
          <table className="min-w-max w-full table-auto text-sm border-collapse select-none">
            <thead className="sticky top-0 z-20 glass-header">
              <tr>
                <th className="border-b border-r border-slate-200 p-3 min-w-[50px] text-slate-400 font-bold">#</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[150px] font-bold text-slate-700">E-mail</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[150px] font-bold text-slate-700">Name</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[150px] font-bold text-slate-700">Mobile no</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[120px] font-bold text-slate-700">Relation</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[100px] font-bold text-slate-700">Error Code</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[200px] font-bold text-slate-700">Remarks</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[150px] font-bold text-slate-700">Status</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[120px] font-bold text-slate-700">Review</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[120px] font-bold text-slate-700">Edit</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[120px] font-bold text-slate-700">Call</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[120px] font-bold text-slate-700">Calling OT</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[120px] font-bold text-slate-700">Edit OT</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[120px] font-bold text-slate-700">Review OT</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[200px] font-bold text-slate-700">কলিং থেকে মন্তব্য</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[200px] font-bold text-slate-700">রিভিউ থেকে মন্তব্য</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[150px] font-bold text-slate-700">Review Time</th>
                <th className="border-b border-r border-slate-200 p-3 min-w-[150px] font-bold text-slate-700">Edit Time</th>
                <th className="border-b border-slate-200 p-3 min-w-[150px] font-bold text-slate-700">Call Time</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="19" className="p-8 text-center text-slate-500 font-medium">Loading data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="19" className="p-16 text-center text-slate-400 text-lg bg-slate-50/50">No data for this date. Click <span className="font-bold text-indigo-500">"+ Add Row"</span> to begin.</td></tr>
            ) : (
              data.map((row, index) => (
                <tr key={row._id || index} className="group border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                  <td className="border-r border-slate-100 p-0 text-center bg-slate-50/80 text-slate-400 font-semibold select-none w-[50px] group-hover:bg-slate-100 transition-colors">{index + 1}</td>
                  {['email', 'name', 'mobileNo', 'relation'].map(field => (
                    <td key={field} className={`border-r border-slate-100 p-0 ${activeCell.rowIndex === index && activeCell.field === field ? 'ring-2 ring-indigo-500 z-10 relative bg-white shadow-sm' : ''}`}>
                      <input type="text" 
                        id={`cell-${index}-${field}`}
                        className="w-full h-full p-1.5 outline-none bg-transparent"
                        style={getInlineStyle(row, field)}
                        value={row[field] || ''} 
                        onChange={(e) => handleChange(index, field, e.target.value)}
                        onFocus={() => handleFocus(index, field, row[field])}
                        onBlur={(e) => handleBlur(row._id, field, e.target.value)} 
                        onKeyDown={(e) => handleKeyDown(e, index, field)}
                      />
                    </td>
                  ))}
                  
                  <td className={`border-r border-slate-100 p-0 relative ${activeCell.rowIndex === index && activeCell.field === 'errorCode' ? 'ring-2 ring-indigo-500 z-10 relative bg-white shadow-sm' : ''}`}>
                    <select 
                      id={`cell-${index}-errorCode`}
                      className="w-full h-full p-1.5 outline-none cursor-pointer bg-transparent"
                      style={getInlineStyle(row, 'errorCode')}
                      value={row.errorCode || ''} 
                      onChange={(e) => handleChange(index, 'errorCode', e.target.value)}
                      onFocus={() => handleFocus(index, 'errorCode', row.errorCode)}
                      onBlur={(e) => handleBlur(row._id, 'errorCode', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'errorCode')}
                    >
                      <option value=""></option>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num < 10 ? `0${num}` : num.toString()}>
                          {num < 10 ? `0${num}` : num}
                        </option>
                      ))}
                      {/* For any old data that was saved as "1" instead of "01" */}
                      {row.errorCode && !/^0[1-9]$|^[1-2][0-9]$|^30$/.test(row.errorCode) && (
                        <option value={row.errorCode}>{row.errorCode}</option>
                      )}
                    </select>
                  </td>

                  <td className={`border-r border-slate-100 p-0 ${activeCell.rowIndex === index && activeCell.field === 'remarks' ? 'ring-2 ring-indigo-500 z-10 relative bg-white shadow-sm' : ''}`}>
                    <input type="text" 
                      id={`cell-${index}-remarks`}
                      className="w-full h-full p-1.5 outline-none bg-transparent"
                      style={getInlineStyle(row, 'remarks')}
                      value={row.remarks || ''} 
                      onChange={(e) => handleChange(index, 'remarks', e.target.value)}
                      onFocus={() => handleFocus(index, 'remarks', row.remarks)}
                      onBlur={(e) => handleBlur(row._id, 'remarks', e.target.value)} 
                      onKeyDown={(e) => handleKeyDown(e, index, 'remarks')}
                    />
                  </td>
                  <td className={`border-r border-slate-100 p-0 relative ${activeCell.rowIndex === index && activeCell.field === 'status' ? 'ring-2 ring-indigo-500 z-10 relative bg-white shadow-sm' : ''}`}>
                    <select 
                      id={`cell-${index}-status`}
                      className={`w-full h-full p-1.5 outline-none cursor-pointer ${getStatusColor(row.status)}`}
                      style={getInlineStyle(row, 'status')}
                      value={row.status || ''} 
                      onChange={(e) => handleChange(index, 'status', e.target.value)}
                      onFocus={() => handleFocus(index, 'status', row.status)}
                      onBlur={(e) => handleBlur(row._id, 'status', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'status')}
                    >
                      <option value=""></option>
                      <option value="Approved">Approved</option>
                      <option value="Edit Approved">Edit Approved</option>
                      <option value="Not Approved">Not Approved</option>
                      <option value="Edit required">Edit required</option>
                      <option value="Waiting for call">Waiting for call</option>
                      <option value="Call Once">Call Once</option>
                      <option value="Pending">Pending</option>
                      <option value="Not Submitted">Not Submitted</option>
                      {/* Allow imported data with weird statuses to render correctly */}
                      {row.status && !['Approved', 'Edit Approved', 'Not Approved', 'Edit required', 'Waiting for call', 'Call Once', 'Pending', 'Not Submitted'].includes(row.status) && (
                        <option value={row.status}>{row.status}</option>
                      )}
                    </select>
                  </td>
                  {['review', 'edit', 'call'].map(field => (
                    <td key={field} className={`border-r border-slate-100 p-0 relative ${activeCell.rowIndex === index && activeCell.field === field ? 'ring-2 ring-indigo-500 z-10 relative bg-white shadow-sm' : ''}`}>
                      <select 
                        id={`cell-${index}-${field}`}
                        className="w-full h-full p-1.5 outline-none cursor-pointer"
                        style={{ ...getInlineStyle(row, field), backgroundColor: row[field] ? getMemberColor(row[field]) : (getInlineStyle(row, field).backgroundColor || 'transparent') }}
                        value={row[field] || ''} 
                        onChange={(e) => handleChange(index, field, e.target.value)}
                        onFocus={() => handleFocus(index, field, row[field])}
                        onBlur={(e) => handleBlur(row._id, field, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, field)}
                      >
                        <option value=""></option>
                        {teamMembers.map(m => (
                          <option key={m._id} value={m.name}>{m.name}</option>
                        ))}
                        {/* Fallback for existing data not in team members */}
                        {row[field] && !teamMembers.find(m => m.name === row[field]) && (
                          <option value={row[field]}>{row[field]}</option>
                        )}
                      </select>
                    </td>
                  ))}
                  {['callingOT', 'editOT', 'reviewOT', 'remarksFromCalling', 'remarksFromReview', 'reviewTime', 'editTime', 'callTime'].map(field => (
                    <td key={field} className={`border-r border-slate-100 p-0 ${activeCell.rowIndex === index && activeCell.field === field ? 'ring-2 ring-indigo-500 z-10 relative bg-white shadow-sm' : ''}`}>
                      <input type="text" 
                        id={`cell-${index}-${field}`}
                        className="w-full h-full p-1.5 outline-none bg-transparent"
                        style={getInlineStyle(row, field)}
                        value={row[field] || ''} 
                        onChange={(e) => handleChange(index, field, e.target.value)}
                        onFocus={() => handleFocus(index, field, row[field])}
                        onBlur={(e) => handleBlur(row._id, field, e.target.value)} 
                        onKeyDown={(e) => handleKeyDown(e, index, field)}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!loading && data.length < 100 && Array.from({ length: 100 - data.length }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-slate-50">
                <td className="border-r border-slate-50 p-0 text-center bg-slate-50/30 text-slate-300 font-semibold select-none w-[50px]">{data.length + i + 1}</td>
                {Array.from({ length: 18 }).map((_, colIndex) => (
                  <td key={`empty-${i}-${colIndex}`} className="border-r border-slate-50 p-2 h-[34px] bg-transparent"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default Dashboard;
