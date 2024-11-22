import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSave, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

function Home() {
  const [userInput, setUserInput] = useState('');
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('streamlist-events');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, eventId: null });
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [deletedEvent, setDeletedEvent] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);
  const [countdown, setCountdown] = useState(10);

  // Save to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('streamlist-events', JSON.stringify(events));
  }, [events]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      const newEvent = {
        id: Date.now(),
        text: userInput,
        completed: false,
        timestamp: new Date().toISOString()
      };
      setEvents([...events, newEvent]);
      setUserInput('');
    }
  };

  const handleDeleteClick = (eventId) => {
    setDeleteModal({ show: true, eventId });
  };

  const confirmDelete = () => {
    const eventToDelete = events.find(event => event.id === deleteModal.eventId);
    setDeletedEvent(eventToDelete);
    setEvents(events.filter(event => event.id !== deleteModal.eventId));
    setDeleteModal({ show: false, eventId: null });
    
    let timeLeft = 10;
    setCountdown(timeLeft);
    
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        setDeletedEvent(null);
        setNotification({ show: false, message: '' });
      }
    }, 1000);
    
    setUndoTimer(timer);
    
    setNotification({
      show: true,
      type: 'delete',
      message: (
        <div style={styles.notificationContent}>
          <span>Event deleted</span>
          <div style={styles.notificationActions}>
            <button 
              onClick={handleUndo} 
              style={styles.undoButton}
            >
              Undo ({timeLeft}s)
            </button>
            <button 
              onClick={dismissNotification} 
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>
        </div>
      )
    });
  };

  const handleUndo = useCallback(() => {
    if (deletedEvent) {
      setEvents(prev => [...prev, deletedEvent]);
      clearInterval(undoTimer);
      setDeletedEvent(null);
      setCountdown(10);
      setNotification({
        show: true,
        type: 'success',
        message: "Event restored!"
      });
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 2000);
    }
  }, [deletedEvent, undoTimer]);

  const dismissNotification = useCallback(() => {
    clearInterval(undoTimer);
    setDeletedEvent(null);
    setCountdown(10);
    setNotification({ show: false, message: '' });
  }, [undoTimer]);

  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      if (undoTimer) {
        clearInterval(undoTimer);
      }
    };
  }, [undoTimer]);

  const startEditing = (event) => {
    if (event.completed) {
      setNotification({
        show: true,
        message: "⚠️ Completed events cannot be edited"
      });
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 2000);
      return;
    }
    setEditingId(event.id);
    setEditingText(event.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (eventId) => {
    if (editingText.trim()) {
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, text: editingText }
          : event
      ));
      setEditingId(null);
      setEditingText('');
    }
  };

  const toggleComplete = (eventId) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const newStatus = !event.completed;
        // Show notification
        setNotification({
          show: true,
          message: newStatus 
            ? "🎉 Event marked as completed!" 
            : "Event marked as incomplete"
        });
        // Hide notification after 2 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '' });
        }, 2000);
        return { ...event, completed: newStatus };
      }
      return event;
    }));
  };

  // Update notification message when countdown changes
  useEffect(() => {
    if (deletedEvent && notification.show) {
      setNotification(prev => ({
        ...prev,
        message: (
          <div style={styles.notificationContent}>
            <span>Event deleted</span>
            <div style={styles.notificationActions}>
              <button 
                onClick={handleUndo} 
                style={styles.undoButton}
              >
                Undo ({countdown}s)
              </button>
              <button 
                onClick={dismissNotification} 
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
          </div>
        )
      }));
    }
  }, [countdown, deletedEvent, notification.show, handleUndo, dismissNotification]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to StreamList</h1>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter an event..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Add Event</button>
      </form>

      <div style={styles.eventsContainer}>
        <h2 style={styles.subtitle}>Events List</h2>
        {events.length === 0 ? (
          <p style={styles.noEvents}>No events added yet</p>
        ) : (
          <ul style={styles.eventsList}>
            {events.map((event) => (
              <li key={event.id} style={{
                ...styles.eventItem,
                backgroundColor: event.completed ? '#f8f9fa' : 'white',
                textDecoration: event.completed ? 'line-through' : 'none'
              }}>
                {editingId === event.id ? (
                  <div style={styles.editContainer}>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      style={styles.editInput}
                    />
                    <button 
                      onClick={() => saveEdit(event.id)}
                      style={styles.iconButton}
                      title="Save"
                    >
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button 
                      onClick={cancelEditing}
                      style={styles.iconButton}
                      title="Cancel"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ) : (
                  <div style={styles.eventContent}>
                    <span>{event.text}</span>
                    <div style={styles.actionButtons}>
                      <button 
                        onClick={() => toggleComplete(event.id)}
                        style={{
                          ...styles.iconButton,
                          color: event.completed ? '#198754' : '#6c757d',
                          backgroundColor: event.completed ? '#e8f5e9' : 'transparent',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          transition: 'all 0.3s ease'
                        }}
                        title={event.completed ? "Mark as incomplete" : "Mark as complete"}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button 
                        onClick={() => startEditing(event)}
                        style={{
                          ...styles.iconButton,
                          color: event.completed ? '#ccc' : '#666',
                          cursor: event.completed ? 'not-allowed' : 'pointer'
                        }}
                        title={event.completed ? "Cannot edit completed events" : "Edit this event"}
                        disabled={event.completed}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(event.id)}
                        style={{
                          ...styles.iconButton,
                          color: '#dc3545'
                        }}
                        title="Delete this event"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        title="Confirm Delete"
        message="Are you sure you want to delete this event?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ show: false, eventId: null })}
      />

      {/* Updated Notification */}
      {notification.show && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'delete' ? '#dc3545' : '#28a745'
        }}>
          {notification.message}
        </div>
      )}

      {/* Add this for testing */}
      <div style={styles.debug}>
        <p>Saved Events: {events.length}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  },
  title: {
    color: '#e50914',
    marginBottom: '2rem'
  },
  subtitle: {
    color: '#e50914',
    marginTop: '2rem'
  },
  form: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  input: {
    padding: '0.5rem',
    width: '300px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e50914',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  eventsContainer: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  eventsList: {
    listStyle: 'none',
    padding: 0,
    margin: '1rem 0'
  },
  eventItem: {
    padding: '0.5rem',
    margin: '0.5rem 0',
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  noEvents: {
    color: '#666',
    fontStyle: 'italic'
  },
  eventContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    padding: '0.25rem',
    fontSize: '1rem',
    transition: 'color 0.3s ease'
  },
  editContainer: {
    display: 'flex',
    gap: '0.5rem',
    width: '100%',
    alignItems: 'center'
  },
  editInput: {
    flex: 1,
    padding: '0.25rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  notification: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-out'
  },
  notificationContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  notificationActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  undoButton: {
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  },
  debug: {
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    padding: '10px',
    background: '#f0f0f0',
    borderRadius: '4px',
    fontSize: '12px'
  }
};

export default Home;