import React, { useState, useEffect } from 'react';
import { useAuth, useToast } from '../App';
import { api, Spinner, SkeletonEvent } from '../utils';
import Header from './Header';
import { Link } from 'lucide-react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ eventName: '', eventDate: '', evidenceLink: '' });
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const data = await api.getEvents(user.id);
      setEvents(data);
    } catch (error) {
      addToast('Ошибка загрузки ивентов', 'error');
    } finally {
      setEventsLoading(false);
    }
  };
  
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.createEvent(newEvent);
      setNewEvent({ eventName: '', eventDate: '', evidenceLink: '' });
      await fetchEvents();
      addToast('Ивент добавлен', 'success');
    } catch (error) {
      addToast('Ошибка создания ивента', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteEvent = async (id) => {
    try {
      await api.deleteEvent(id);
      await fetchEvents();
      addToast('Ивент удален', 'success');
    } catch (error) {
      addToast('Ошибка удаления ивента', 'error');
    }
  };
  
  return (
    <div className="dashboard">
      <Header />
      
      <div className="dashboard-content">
        <div className="event-form">
          <h2>Добавить ивент</h2>
          <form onSubmit={handleCreateEvent}>
            <input
              type="text"
              placeholder="Название ивента"
              value={newEvent.eventName}
              onChange={(e) => setNewEvent(prev => ({ ...prev, eventName: e.target.value }))}
              required
            />
            <input
              type="date"
              value={newEvent.eventDate}
              onChange={(e) => setNewEvent(prev => ({ ...prev, eventDate: e.target.value }))}
              required
            />
            <input
              type="url"
              placeholder="Ссылка на доказательства"
              value={newEvent.evidenceLink}
              onChange={(e) => setNewEvent(prev => ({ ...prev, evidenceLink: e.target.value }))}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Добавить'}
            </button>
          </form>
        </div>
        
        <div className="events-list">
          <h2>Ваши ивенты</h2>
          {eventsLoading ? (
            Array(3).fill(0).map((_, i) => <SkeletonEvent key={i} />)
          ) : events.length === 0 ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '20px' }}>
              У вас пока нет ивентов
            </p>
          ) : (
            events.map(event => (
              <div key={event.id} className="event-item">
                <div style={{ flex: 1 }}>
                  <h3>{event.eventName}</h3>
                  <p>{new Date(event.eventDate).toLocaleDateString('ru')}</p>
                  {event.evidenceLink && (
                    <a href={event.evidenceLink} target="_blank" rel="noopener noreferrer">
                      <Link size={14} style={{ marginRight: '6px' }} />
                      Доказательства
                    </a>
                  )}
                </div>
                <button className="delete-btn" onClick={() => deleteEvent(event.id)}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="footer">
        <div className="footer-content">
          <span>Разработано при поддержке</span>
          <a href="https://t.me/flizan_0" target="_blank" rel="noopener noreferrer" className="footer-link">
            Flizan
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;