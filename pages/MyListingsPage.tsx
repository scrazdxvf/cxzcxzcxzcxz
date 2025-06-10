
import React, { useState, useEffect, useCallback } from 'react';
import { Product, AdStatus } from '../types';
import { listingService } from '../services/listingService';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import { useAuth } from '../components/auth/AuthContext'; // Import useAuth

type TabKey = AdStatus.ACTIVE | AdStatus.PENDING | AdStatus.REJECTED;

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading: authIsLoading } = useAuth(); // Get current user

  const [userListings, setUserListings] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(AdStatus.ACTIVE);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserListings = useCallback(async () => {
    if (!currentUser || authIsLoading) {
        setIsLoading(false); // Stop loading if no user or auth is still loading
        if(!authIsLoading && !currentUser) setError("Пожалуйста, войдите, чтобы увидеть ваши объявления.");
        setUserListings([]);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const listings = await listingService.getListingsByUserId(currentUser.id);
      setUserListings(listings);
    } catch (err) {
      setError('Не удалось загрузить ваши объявления.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, authIsLoading]);

  useEffect(() => {
    fetchUserListings();
  }, [fetchUserListings]);

  const handleDeleteClick = (product: Product) => {
    setListingToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!listingToDelete) return;
    setIsDeleting(true);
    try {
      await listingService.deleteListing(listingToDelete.id);
      setUserListings(prev => prev.filter(p => p.id !== listingToDelete.id));
      setShowDeleteModal(false);
      setListingToDelete(null);
    } catch (err) {
      console.error("Failed to delete listing:", err);
      // Show error to user
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredListings = userListings.filter(p => p.status === activeTab);

  const tabConfigs: { key: TabKey; label: string; icon: string }[] = [
    { key: AdStatus.ACTIVE, label: 'Активные', icon: 'fa-solid fa-check-circle' },
    { key: AdStatus.PENDING, label: 'На проверке', icon: 'fa-solid fa-clock' },
    { key: AdStatus.REJECTED, label: 'Отклоненные', icon: 'fa-solid fa-times-circle' },
  ];

  if (isLoading || authIsLoading) return <Spinner fullPage />;
  
  if (!currentUser && !authIsLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 text-center">
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-4">{error || "Пожалуйста, войдите, чтобы управлять вашими объявлениями."}</p>
        <Button onClick={() => navigate('/login')} variant="primary">Войти</Button>
      </div>
    );
  }
  
  if (error && currentUser) return <div className="text-center text-red-500 dark:text-red-400 p-8">{error}</div>;


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">Мои объявления</h1>
        <Button onClick={() => navigate('/create-listing')} variant="primary" leftIcon={<i className="fa-solid fa-plus"></i>}>
          Новое объявление
        </Button>
      </div>

      <div className="mb-6 border-b border-slate-200 dark:border-slate-700 flex space-x-1 sm:space-x-4 overflow-x-auto">
        {tabConfigs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-3 py-3 text-sm sm:text-base font-medium whitespace-nowrap focus:outline-none ${
              activeTab === tab.key
                ? 'border-b-2 border-sky-500 dark:border-dark-accent text-sky-600 dark:text-dark-accent'
                : 'border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label} ({userListings.filter(p => p.status === tab.key).length})
          </button>
        ))}
      </div>

      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 p-1 bg-black/30 rounded-md">
                 <Button 
                    size="sm" 
                    variant="secondary" 
                    className="!p-2"
                    onClick={() => navigate(`/edit-listing/${product.id}`)}
                    title="Редактировать"
                  >
                    <i className="fa-solid fa-edit"></i>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    className="!p-2"
                    onClick={() => handleDeleteClick(product)}
                    title="Удалить"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </Button>
              </div>
              {product.status === AdStatus.REJECTED && product.rejectionReason && (
                <div className="mt-1 p-2 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-xs text-red-700 dark:text-red-200">
                  <strong>Причина отклонения:</strong> {product.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
           <i className={`fa-solid fa-folder-open text-6xl text-slate-400 dark:text-slate-500 mb-4`}></i>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            {activeTab === AdStatus.ACTIVE && "У вас пока нет активных объявлений."}
            {activeTab === AdStatus.PENDING && "Нет объявлений на проверке."}
            {activeTab === AdStatus.REJECTED && "Нет отклоненных объявлений."}
          </p>
          {activeTab === AdStatus.ACTIVE && (
            <Button onClick={() => navigate('/create-listing')} variant="primary" className="mt-4">
              Создать первое объявление
            </Button>
          )}
        </div>
      )}
      
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Подтвердить удаление">
        {listingToDelete && (
          <div>
            <p className="text-slate-700 dark:text-dark-text-secondary mb-4">
              Вы уверены, что хотите удалить объявление "{listingToDelete.title}"? Это действие необратимо.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Отмена
              </Button>
              <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
                Удалить
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyListingsPage;
