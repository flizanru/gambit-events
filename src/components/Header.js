import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Table2, Settings, LogOut, DollarSign, Trash2, Lock } from 'lucide-react';
import { useAuth, useToast } from '../App';

const Header = ({ onDeleteAll, onCopyCommands }) => {
  const [isInitial, setIsInitial] = useState(true);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    setIsInitial(false);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  const handleDeleteAll = async () => {
    if (isAdmin && onDeleteAll) {
      onDeleteAll();
    } else if (!isAdmin) {
      addToast('Только для администраторов', 'error');
    }
  };

  const handleCopyCommands = () => {
    if (isAdmin && onCopyCommands) {
      onCopyCommands();
    } else if (!isAdmin) {
      addToast('Только для администраторов', 'error');
    }
  };

  return (
    <div className={`floating-header ${isInitial ? 'initial-animation' : ''}`}>
      <div className="floating-header-content">
        <span className="header-title">Events Gambit</span>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/dashboard')}
            className={isActive('/dashboard') ? 'active' : ''}
          >
            <Calendar size={16} />
            События
          </button>
          
          <button 
            onClick={() => navigate('/table')}
            className={isActive('/table') ? 'active' : ''}
          >
            <Table2 size={16} />
            Таблица
          </button>
          
          <button 
            onClick={() => isAdmin ? navigate('/admin') : addToast('Только для администраторов', 'error')}
            disabled={!isAdmin}
            className={isActive('/admin') ? 'active' : ''}
          >
            {isAdmin ? <Settings size={16} /> : <Lock size={16} />}
            Управление
          </button>

          <button 
            onClick={handleCopyCommands} 
            disabled={!isAdmin}
            className="special-btn"
          >
            {isAdmin ? <DollarSign size={16} /> : <Lock size={16} />}
            Команды
          </button>
          
          <button 
            onClick={handleDeleteAll} 
            disabled={!isAdmin}
            className="danger-btn"
          >
            {isAdmin ? <Trash2 size={16} /> : <Lock size={16} />}
            Очистить
          </button>
          
          <button onClick={logout} className="logout-btn">
            <LogOut size={16} />
            Выход
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;