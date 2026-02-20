import React from 'react';

const MethodSelector = ({ method, onChange }) => (
  <select value={method} onChange={e => onChange(e.target.value)}>
    <option value="GET">GET</option>
    <option value="POST">POST</option>
    <option value="PUT">PUT</option>
    <option value="DELETE">DELETE</option>
  </select>
);

export default MethodSelector;
