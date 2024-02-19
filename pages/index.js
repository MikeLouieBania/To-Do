"use client"
import { useState, useEffect } from "react";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [activeTab, setActiveTab] = useState('ongoing');
  const [editMode, setEditMode] = useState(null);
  const [editedTask, setEditedTask] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const fetchedTasks = await response.json();
        setTasks(fetchedTasks);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, status: 'ongoing' }),
    });

    if (response.ok) {
      const addedTask = await response.json();
      setTasks([...tasks, addedTask]);
      setTask('');
    }
  };

  const markAsDone = async (id) => {
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status: 'completed' }),
    });

    if (response.ok) {
      setTasks(tasks.map(task => task._id === id ? { ...task, status: 'completed' } : task));
    }
  };

  const deleteTask = async (id) => {
    const response = await fetch('/api/tasks', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setTasks(tasks.filter(task => task._id !== id));
    }
  };

  const enableEditMode = (task) => {
    setEditMode(task._id);
    setEditedTask(task.task);
  };

  const saveEdit = async (id) => {
    if (editedTask.trim() === '') {
      return; // Prevent saving empty task names
    }
    await editTask(id, editedTask);
    setEditMode(null);
  };

  const editTask = async (id, newTaskName) => {
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, task: newTaskName }),
    });

    if (response.ok) {
      setTasks(tasks.map(task => task._id === id ? { ...task, task: newTaskName } : task));
      setEditedTask(''); // Clear the edited task state
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`flex-1 p-2 ${activeTab === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-md`}
        >
          Ongoing
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 p-2 ${activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-md`}
        >
          Completed
        </button>
      </div>

      {activeTab === 'ongoing' && (
        <form onSubmit={addTask} className="mb-4 flex space-x-2">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="flex-1 border p-2 rounded-md text-black"
            placeholder="Add a new task"
          />
          <button type="submit" className="px-4 py-2 border bg-blue-500 text-white rounded-md">Add Task</button>
        </form>
      )}

      <div>
        {activeTab === 'ongoing' && (
          <ul className="space-y-2">
            {tasks.filter(task => task.status === 'ongoing').map((task) => (
              <li key={task._id} className="border-b py-2 flex justify-between items-center space-x-2">
                {editMode === task._id ? (
                  <>
                    <input
                      type="text"
                      value={editedTask}
                      onChange={(e) => setEditedTask(e.target.value)}
                      className="flex-1 border p-2 mr-2 rounded-md text-black"
                    />
                    <button onClick={() => saveEdit(task._id)} className="px-4 py-2 border bg-blue-500 text-white rounded-md">Save</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{task.task}</span>
                    <button onClick={() => enableEditMode(task)} className="px-4 py-2 border bg-gray-300 text-black rounded-md">Edit</button>
                    <button onClick={() => markAsDone(task._id)} className="px-4 py-2 border bg-green-500 text-white rounded-md">Mark as Done</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'completed' && (
          <ul className="space-y-2">
            {tasks.filter(task => task.status === 'completed').map((task) => (
              <li key={task._id} className="border-b py-2 flex justify-between items-center">
                <span className="flex-1">{task.task}</span>
                <button onClick={() => deleteTask(task._id)} className="px-4 py-2 border bg-red-500 text-white rounded-md">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}