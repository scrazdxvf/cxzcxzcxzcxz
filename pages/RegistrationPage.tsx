
import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading: authIsLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов.');
      return;
    }

    const user = await register(username, password);
    if (user) {
      navigate('/'); // Redirect to home or /my-listings
    } else {
      setError('Пользователь с таким логином уже существует или произошла ошибка.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-secondary dark:bg-dark-secondary p-4">
      <div className="w-full max-w-md bg-light-primary dark:bg-dark-primary p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
           <Link to="/">
            <Logo className="text-3xl justify-center" />
          </Link>
          <h2 className="mt-2 text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Создание аккаунта
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="username"
            name="username"
            type="text"
            label="Логин (или Telegram username)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Придумайте логин"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Придумайте пароль (мин. 6 симв.)"
            required
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Повторите пароль"
            required
          />
          {error && <p className="text-sm text-red-500 text-center -mt-2">{error}</p>}
          <Button type="submit" variant="primary" size="lg" isLoading={authIsLoading} className="w-full">
            Зарегистрироваться
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500 dark:text-dark-accent dark:hover:text-sky-400">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
