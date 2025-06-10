
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/product/ProductForm';
import { listingService } from '../services/listingService';
import { Product } from '../types';
import Button from '../components/ui/Button';
import { useAuth } from '../components/auth/AuthContext'; // Import useAuth

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!currentUser) {
      setError('Вы должны быть авторизованы для создания объявления.');
      // Optionally navigate to login: navigate('/login', { state: { from: location } });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      // ProductForm now includes userId if not initialProduct, or it's passed here
      const dataToSubmit = { ...productData, userId: currentUser.id };
      await listingService.createListing(dataToSubmit as Omit<Product, 'id' | 'createdAt' | 'status'>);
      navigate(`/my-listings`); 
    } catch (err) {
      console.error("Failed to create listing:", err);
      setError('Не удалось создать объявление. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
       <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4">
        <i className="fa-solid fa-arrow-left mr-2"></i> Назад
      </Button>
      <ProductForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        submitButtonText="Разместить и отправить на проверку"
      />
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default CreateListingPage;
