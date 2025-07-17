import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function TaskApp() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchTasks = async () => {
    const res = await api.get('/');
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    const res = await api.post('/', { text });
    setTasks([res.data, ...tasks]);
    setText('');
  };

  const toggle = async (id) => {
    const task = tasks.find(t => t._id === id);
    console.log("Toggling task:", id, "Current:", task.completed);
    try {
      const res = await api.put(`/${id}`, { completed: !task.completed });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const del = async (id) => {
    await api.delete(`/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = async (id) => {
    const res = await api.put(`/${id}`, { text: editText });
    setTasks(tasks.map(t => t._id === id ? res.data : t));
    setEditingId(null);
    setEditText('');
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      <h1>To‑Do List</h1>
      <form onSubmit={addTask}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="New task..."
          required
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map(t => (
          <li key={t._id}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggle(t._id)}
            />
            {editingId === t._id ? (
              <>
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                />
                <button onClick={() => saveEdit(t._id)}>Save</button>
              </>
            ) : (
              <>
                <span style={{ textDecoration: t.completed ? 'line-through' : '' }}>
                  {t.text}
                </span>
                <button onClick={() => startEdit(t._id, t.text)}>✏️</button>
              </>
            )}
            <button onClick={() => del(t._id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
