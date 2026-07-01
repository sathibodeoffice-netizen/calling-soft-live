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
    <div className="flex flex-col h-[95vh] bg-gray-50 relative">
      {/* Member Modal */}
      {showMemberModal && (
        <div className="absolute inset-0 bg-black/30 z-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg flex flex-col gap-3 min-w-[250px]">
            <h3 className="font-bold text-gray-700">Add New Member</h3>
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
            <div className="flex justify-end gap-2 mt-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded font-bold" onClick={handleAddMember}>Add</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-2 px-2 pt-2">
        <h2 className="text-xl font-bold text-gray-800">Calling Sheet</h2>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-semibold text-gray-600">Sheet:</label>
          <select 
            value={sheetDate}
            onChange={(e) => setSheetDate(e.target.value)}
            className="border border-gray-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm min-w-[100px]"
          >
            {availableSheets.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          {showNewPageInput ? (
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded p-1 ml-1">
              <input 
                type="text" placeholder="e.g. 15 Feb 26" value={newPageDate}
                onChange={(e) => setNewPageDate(e.target.value)}
                className="p-1 outline-none w-[90px] text-xs"
              />
              <button onClick={handleAddNewPage} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">OK</button>
              <button onClick={() => setShowNewPageInput(false)} className="bg-gray-400 text-white px-2 py-1 rounded text-xs">X</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowNewPageInput(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded shadow text-sm ml-1"
            >
              + Add Page
            </button>
          )}
          <button 
            onClick={handleAddRow}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded shadow text-sm ml-1"
          >
            + Add Row
          </button>
          <button 
            onClick={() => setShowMemberModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded shadow text-sm ml-1"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Google Sheets Toolbar */}
      <div className="flex flex-col border-y border-gray-300 bg-[#f8f9fa]">
        <div className="flex items-center gap-2 px-4 py-1.5 overflow-x-auto">
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Search size={16} /></button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Undo size={16} /></button>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Redo size={16} /></button>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600" onClick={() => window.print()}><Printer size={16} /></button>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><PaintRoller size={16} /></button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1 text-sm">100%</button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1 text-sm font-sans">Arial</button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600 flex items-center gap-1 text-sm">10</button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          
          {/* Working Formatting Tools */}
          <button 
            className={`p-1 hover:bg-gray-200 rounded ${activeCell.rowIndex !== null && data[activeCell.rowIndex]?.styles?.[activeCell.field]?.bold ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`} 
            onClick={() => handleFormat('bold')} title="Bold">
            <Bold size={16} />
          </button>
          <button 
            className={`p-1 hover:bg-gray-200 rounded ${activeCell.rowIndex !== null && data[activeCell.rowIndex]?.styles?.[activeCell.field]?.italic ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`} 
            onClick={() => handleFormat('italic')} title="Italic">
            <Italic size={16} />
          </button>
          <button 
            className={`p-1 hover:bg-gray-200 rounded ${activeCell.rowIndex !== null && data[activeCell.rowIndex]?.styles?.[activeCell.field]?.strikethrough ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`} 
            onClick={() => handleFormat('strikethrough')} title="Strikethrough">
            <Strikethrough size={16} />
          </button>
          <div className="relative group flex items-center">
             <button className="p-1 hover:bg-gray-200 rounded text-gray-700" title="Text Color"><Baseline size={16} /></button>
             <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={(e) => handleFormat('color', e.target.value)} />
          </div>
          <div className="relative group flex items-center">
             <button className="p-1 hover:bg-gray-200 rounded text-gray-700" title="Fill Color"><PaintBucket size={16} /></button>
             <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={(e) => handleFormat('backgroundColor', e.target.value)} />
          </div>
          
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Grid size={16} /></button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600" onClick={() => handleFormat('align', 'left')}><AlignLeft size={16} /></button>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600" onClick={() => handleFormat('align', 'center')}><AlignCenter size={16} /></button>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-600" onClick={() => handleFormat('align', 'right')}><AlignRight size={16} /></button>
        </div>

        {/* Formula Bar */}
        <div className="flex items-center gap-2 px-3 py-1 bg-white border-t border-gray-300 shadow-sm text-sm">
          <div className="text-gray-500 italic font-serif font-bold px-2 border-r border-gray-300">fx</div>
          <input 
            type="text" 
            className="flex-1 outline-none px-2 font-mono text-sm" 
            value={activeCellValue}
            onChange={handleFormulaBarChange}
            onBlur={handleFormulaBarBlur}
            placeholder={activeCell.rowIndex !== null ? `Editing row ${activeCell.rowIndex + 1}, column ${activeCell.field}` : ''}
          />
        </div>
      </div>

      {/* Spreadsheet Body */}
      <div className="flex-1 bg-white shadow-sm overflow-auto">
        <table className="min-w-max w-full table-auto text-sm border-collapse border border-gray-300 select-none">
          <thead className="sticky top-0 bg-gray-100 shadow-sm z-10 select-none">
            <tr>
              <th className="border border-gray-300 p-2 min-w-[50px] bg-gray-200 text-gray-600"></th>
              <th className="border border-gray-300 p-2 min-w-[150px] font-semibold text-gray-700">E-mail</th>
              <th className="border border-gray-300 p-2 min-w-[150px] font-semibold text-gray-700">Name</th>
              <th className="border border-gray-300 p-2 min-w-[150px] font-semibold text-gray-700">Mobile no</th>
              <th className="border border-gray-300 p-2 min-w-[100px] font-semibold text-gray-700">Relation</th>
              <th className="border border-gray-300 p-2 min-w-[100px] font-semibold text-gray-700">Error Code</th>
              <th className="border border-gray-300 p-2 min-w-[200px] font-semibold text-gray-700">Remarks</th>
              <th className="border border-gray-300 p-2 min-w-[150px] font-semibold text-gray-700">Status</th>
              <th className="border border-gray-300 p-2 min-w-[120px] font-semibold text-gray-700">Review</th>
              <th className="border border-gray-300 p-2 min-w-[120px] font-semibold text-gray-700">Edit</th>
              <th className="border border-gray-300 p-2 min-w-[120px] font-semibold text-gray-700">Call</th>
              <th className="border border-gray-300 p-2 min-w-[120px] font-semibold text-gray-700">Calling OT</th>
              <th className="border border-gray-300 p-2 min-w-[120px] font-semibold text-gray-700">Edit OT</th>
              <th className="border border-gray-300 p-2 min-w-[120px] font-semibold text-gray-700">Review OT</th>
              <th className="border border-gray-300 p-2 min-w-[200px] font-semibold text-gray-700">কলিং থেকে মন্তব্য</th>
              <th className="border border-gray-300 p-2 min-w-[200px] font-semibold text-gray-700">রিভিউ থেকে মন্তব্য</th>
              <th className="border border-gray-300 p-2 min-w-[150px] font-semibold text-gray-700">Review Time</th>
              <th className="border border-gray-300 p-2 min-w-[150px] font-semibold text-gray-700">Edit Time</th>
              <th className="border border-gray-300 p-2 min-w-[150px] font-semibold text-gray-700">Call Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="19" className="p-4 text-center border border-gray-300">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="19" className="p-10 text-center text-gray-500 border border-gray-300 bg-gray-50 text-lg">No data for this date. Click "+ Add Row" to begin.</td></tr>
            ) : (
              data.map((row, index) => (
                <tr key={row._id || index} className="hover:bg-blue-50 border-b border-gray-200">
                  <td className="border border-gray-300 p-0 text-center bg-gray-100 text-gray-600 font-semibold select-none w-[50px]">{index + 1}</td>
                  {['email', 'name', 'mobileNo', 'relation'].map(field => (
                    <td key={field} className={`border border-gray-300 p-0 ${activeCell.rowIndex === index && activeCell.field === field ? 'ring-2 ring-blue-500 z-10 relative' : ''}`}>
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
                  
                  <td className={`border border-gray-300 p-0 relative ${activeCell.rowIndex === index && activeCell.field === 'errorCode' ? 'ring-2 ring-blue-500 z-10 relative' : ''}`}>
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

                  <td className={`border border-gray-300 p-0 ${activeCell.rowIndex === index && activeCell.field === 'remarks' ? 'ring-2 ring-blue-500 z-10 relative' : ''}`}>
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
                  <td className={`border border-gray-300 p-0 relative ${activeCell.rowIndex === index && activeCell.field === 'status' ? 'ring-2 ring-blue-500 z-10 relative' : ''}`}>
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
                    <td key={field} className={`border border-gray-300 p-0 relative ${activeCell.rowIndex === index && activeCell.field === field ? 'ring-2 ring-blue-500 z-10 relative' : ''}`}>
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
                    <td key={field} className={`border border-gray-300 p-0 ${activeCell.rowIndex === index && activeCell.field === field ? 'ring-2 ring-blue-500 z-10 relative' : ''}`}>
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
              <tr key={`empty-${i}`} className="border-b border-gray-200">
                <td className="border border-gray-300 p-0 text-center bg-gray-50 text-gray-400 font-semibold select-none w-[50px]">{data.length + i + 1}</td>
                {Array.from({ length: 18 }).map((_, colIndex) => (
                  <td key={`empty-${i}-${colIndex}`} className="border border-gray-300 p-2 h-8 bg-gray-50/30"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
