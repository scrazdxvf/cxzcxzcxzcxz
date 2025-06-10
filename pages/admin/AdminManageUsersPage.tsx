
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import { useAuth } from '../../components/auth/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminManageUsersPage: React.FC = () => {
  const { users, isLoading: authLoading } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    if (authLoading) return;

    let currentUsers = [...users];
    const filterType = queryParams.get('filter');

    if (filterType === 'last24h') {
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      currentUsers = currentUsers.filter(user => user.createdAt >= twentyFourHoursAgo);
    }
    
    if (searchTerm) {
      currentUsers = currentUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(currentUsers.sort((a,b) => b.createdAt - a.createdAt));
  }, [users, authLoading, searchTerm, queryParams]);

  if (authLoading) return <Spinner fullPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">Управление пользователями</h1>

      <div className="mb-6 p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow">
        <Input
          label="Поиск по логину или ID пользователя"
          placeholder="Введите логин или ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          wrapperClassName="mb-0"
        />
        {queryParams.get('filter') === 'last24h' && (
             <Button variant="link" onClick={() => navigate('/admin/manage-users')} className="mt-2 text-sm">
                Сбросить фильтр "Новые за 24ч"
            </Button>
        )}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <i className="fa-solid fa-users-slash text-6xl text-slate-400 dark:text-slate-500 mb-4"></i>
          <p className="text-xl text-slate-600 dark:text-slate-300">Пользователи не найдены.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-light-primary dark:bg-dark-primary shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID Пользователя</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Логин</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Дата регистрации</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/admin/manage-listings?userId=${user.id}`} 
                      className="text-sky-600 hover:text-sky-800 dark:text-dark-accent dark:hover:text-sky-300"
                      title="Посмотреть объявления пользователя"
                    >
                      Объявления <i className="fa-solid fa-external-link-alt ml-1"></i>
                    </Link>
                    {/* Пароли не отображаются из соображений безопасности */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Примечание: Пароли пользователей не отображаются из соображений безопасности. Для сброса пароля или других действий обратитесь к более продвинутым инструментам управления (если бы они были в реальном приложении).
      </p>
    </div>
  );
};

export default AdminManageUsersPage;