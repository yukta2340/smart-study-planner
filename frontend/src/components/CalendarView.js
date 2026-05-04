import React, { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { addTask, updateTask, deleteTask } from "../services/api";

function CalendarView({ tasks = [], refreshTasks }) {
  const [events, setEvents] = useState([]);

  // 🎨 Color mapping
  const subjectColors = useMemo(() => ({
    Math: "#ff6b6b",
    Science: "#4ecdc4",
    Coding: "#667eea",
    Default: "#999",
  }), []);

  // 📥 Format tasks for calendar
  useEffect(() => {
    const formatted = tasks.map((task) => ({
      id: task._id,
      title: task.title || task.subject,
      start: task.deadline,
      backgroundColor:
        subjectColors[task.title || task.subject] || subjectColors.Default,
    }));

    setEvents(formatted);
  }, [tasks, subjectColors]);

  // ➕ Add task
  const handleDateClick = async (info) => {
    const subject = prompt("Enter task title");
    if (!subject) return;

    try {
      await addTask({
        title: subject,
        deadline: info.dateStr,
        difficulty: 3,
      });

      if (refreshTasks) refreshTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // 🖱️ Drag & Drop update
  const handleEventDrop = async (info) => {
    try {
      await updateTask(info.event.id, {
        deadline: info.event.startStr,
      });

      if (refreshTasks) refreshTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ❌ Delete task
  const handleEventClick = async (info) => {
    const confirmDelete = window.confirm("Delete this task?");
    if (!confirmDelete) return;

    try {
      await deleteTask(info.event.id);
      if (refreshTasks) refreshTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="calendar-container">

      <h2>📅 Smart Study Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date()}
        events={events}
        editable={true}
        selectable={true}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        height="auto"
        contentHeight="auto"
        dayMaxEvents={3}
      />
    </div>
  );
}

export default CalendarView;