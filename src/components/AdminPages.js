import React, { useState, useEffect } from 'react';
import { useAuth, useToast } from '../App';
import { api, SkeletonRow, Spinner } from '../utils';
import Header from './Header';
import { Link, X } from 'lucide-react';

export const Table = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      addToast('Ошибка загрузки пользователей', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAllUserEvents = async (userId) => {
    if (!isAdmin) {
      addToast('Только для администраторов', 'error');
      return;
    }
    
    try {
      await api.deleteAllUserEvents(userId);
      await fetchUsers();
      addToast('Ивенты пользователя удалены', 'success');
    } catch (error) {
      addToast('Ошибка удаления ивентов', 'error');
    }
  };
  
  const getUsersByServer = (server) => {
    return users
      .filter(user => user.server === server && user.nickname !== 'flizan')
      .sort((a, b) => {
        const priority = { ruk_eventer: 1, eventer: 2, test_eventer: 3 };
        return priority[a.userType] - priority[b.userType];
      });
  };
  
  return (
    <div className="table-page">
      <Header />
      
      <div className="servers-grid">
        {[1, 2].map(server => (
          <div key={server} className="server-section">
            <h2>GambitRP #{server}</h2>
            <div className="users-table">
              <div className="table-header-row" style={{ 
                gridTemplateColumns: isAdmin ? '2fr 1.5fr 0.8fr 0.8fr 1fr' : '2fr 1.5fr 0.8fr 0.8fr'
              }}>
                <span>Ивентер</span>
                <span>Роль</span>
                <span>Варны</span>
                <span>Ивенты</span>
                {isAdmin && <span>Действие</span>}
              </div>
              
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                getUsersByServer(server).map(user => (
                  <div key={user.id} className={`table-row ${user.userType}`} style={{ 
                    gridTemplateColumns: isAdmin ? '2fr 1.5fr 0.8fr 0.8fr 1fr' : '2fr 1.5fr 0.8fr 0.8fr'
                  }}>
                    <span>{user.nickname}</span>
                    <span>
                      {user.userType === 'ruk_eventer' ? 'Рук.Ивентеров' : 
                       user.userType === 'eventer' ? 'Ивентер' : 
                       'Тест Ивентер'}
                    </span>
                    <span>{user.warnings}</span>
                    <span>{user.Events.length}</span>
                    {isAdmin && (
                      <button 
                        className="delete-btn" 
                        onClick={() => deleteAllUserEvents(user.id)}
                        title="Удалить все ивенты"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
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

export const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeServer, setActiveServer] = useState(1);
  const { addToast } = useToast();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
      if (selectedUser) {
        const updatedUser = data.find(u => u.id === selectedUser.id);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      addToast('Ошибка загрузки пользователей', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const copyPayoutCommands = () => {
    const payoutRates = {
      ruk_eventer: 250,
      eventer: 30,
      test_eventer: 20
    };
    
    // Сортируем по серверам: сначала сервер 1, потом сервер 2
    const sortedUsers = [...users].sort((a, b) => a.server - b.server);
    
    const commands = sortedUsers
      .filter(user => user.Events.length > 0 && user.nickname !== 'flizan') // Только те, у кого есть ивенты и не flizan
      .map(user => {
        const payout = payoutRates[user.userType] * user.Events.length;
        const consoleCmd = user.server === 1 ? '!console1' : '!console2';
        return `${consoleCmd} donategive ${user.steamid || 'NO_STEAMID'} ${payout}`;
      })
      .join('\n');
    
    if (commands) {
      navigator.clipboard.writeText(commands);
      addToast('Команды скопированы', 'success');
    } else {
      addToast('Нет ивентов для выплат', 'info');
    }
  };
  
  const updateWarnings = async (userId, action) => {
    setActionLoading(true);
    try {
      await api.updateWarnings(userId, action);
      await fetchUsers();
      addToast(action === 'add' ? 'Варн добавлен' : 'Варн удален', 'success');
    } catch (error) {
      addToast('Ошибка обновления варнов', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const deleteEvent = async (eventId) => {
    setActionLoading(true);
    try {
      await api.deleteEvent(eventId);
      await fetchUsers();
      addToast('Ивент удален', 'success');
    } catch (error) {
      addToast('Ошибка удаления ивента', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const deleteAllEvents = async () => {
    const confirmed = window.confirm(
      '⚠️ ВНИМАНИЕ!\n\nВы действительно хотите удалить ВСЕ ивенты?\n\nЭто действие нельзя отменить!'
    );
    
    if (!confirmed) {
      addToast('Удаление отменено', 'info');
      return;
    }

    const doubleConfirm = window.confirm(
      '🚨 ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ!\n\nВведите "УДАЛИТЬ" в следующем окне для подтверждения.'
    );

    if (!doubleConfirm) {
      addToast('Удаление отменено', 'info');
      return;
    }

    try {
      await api.deleteAllEvents();
      await fetchUsers();
      addToast('Все ивенты удалены', 'success');
    } catch (error) {
      addToast('Ошибка удаления всех ивентов', 'error');
    }
  };
  
  const getUsersByServer = (server) => {
    return users
      .filter(user => user.server === server && user.nickname !== 'flizan')
      .sort((a, b) => {
        const priority = { ruk_eventer: 1, eventer: 2, test_eventer: 3 };
        return priority[a.userType] - priority[b.userType];
      });
  };
  
  return (
    <div className="admin-panel">
      <Header onDeleteAll={deleteAllEvents} onCopyCommands={copyPayoutCommands} />
      
      <div className="admin-content-new">
        {!selectedUser && (
          <>
            <div className="server-tabs">
              <button 
                className={activeServer === 1 ? 'active' : ''} 
                onClick={() => setActiveServer(1)}
              >
                GambitRP #1
              </button>
              <button 
                className={activeServer === 2 ? 'active' : ''} 
                onClick={() => setActiveServer(2)}
              >
                GambitRP #2
              </button>
            </div>

            <div className="users-grid">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="user-card skeleton-card">
                    <div className="skeleton" style={{ height: '24px', width: '60%' }}></div>
                    <div className="skeleton" style={{ height: '16px', width: '40%', marginTop: '8px' }}></div>
                  </div>
                ))
              ) : (
                getUsersByServer(activeServer).map(user => (
                  <div
                    key={user.id}
                    className={`user-card ${user.userType}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="user-card-header">
                      <h3>{user.nickname}</h3>
                      <span className={`role-badge ${user.userType}`}>
                        {user.userType === 'ruk_eventer' ? 'Рук' : 
                         user.userType === 'eventer' ? 'Ивентер' : 
                         'Тест'}
                      </span>
                    </div>
                    <div className="user-card-stats">
                      <div className="stat">
                        <span className="stat-label">Ивенты</span>
                        <span className="stat-value">{user.Events.length}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Варны</span>
                        <span className="stat-value">{user.warnings}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {selectedUser && (
          <div className="user-details-panel">
            <button className="back-button" onClick={() => setSelectedUser(null)}>
              ← Назад
            </button>

            <div className="panel-header">
              <h2>{selectedUser.nickname}</h2>
            </div>

            <div className="warning-controls">
              <button 
                onClick={() => updateWarnings(selectedUser.id, 'add')}
                disabled={actionLoading}
                className="add-warn-btn"
              >
                {actionLoading ? <Spinner /> : '+ Варн'}
              </button>
              <div className="warning-display">
                <span className="warning-count">{selectedUser.warnings}</span>
                <span className="warning-label">варнов</span>
              </div>
              <button 
                onClick={() => updateWarnings(selectedUser.id, 'remove')}
                disabled={actionLoading || selectedUser.warnings === 0}
                className="remove-warn-btn"
              >
                {actionLoading ? <Spinner /> : '- Варн'}
              </button>
            </div>

            <div className="events-compact">
              <h3>Ивенты ({selectedUser.Events.length})</h3>
              {selectedUser.Events.length === 0 ? (
                <p className="empty-state">Нет ивентов</p>
              ) : (
                <div className="events-list-compact">
                  {selectedUser.Events.map(event => (
                    <div key={event.id} className="event-compact">
                      <div className="event-compact-header">
                        <div className="event-info">
                          <span className="event-name">{event.eventName}</span>
                          <span className="event-date">
                            {new Date(event.eventDate).toLocaleDateString('ru')}
                          </span>
                        </div>
                        <button 
                          className="delete-btn-small" 
                          onClick={() => deleteEvent(event.id)}
                          disabled={actionLoading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {event.evidenceLink && (
                        <a 
                          href={event.evidenceLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="event-evidence-link"
                        >
                          <Link size={14} style={{ marginRight: '6px' }} />
                          Доказательства
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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