
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import ProductForm from '../components/product/ProductForm';
import { listingService } from '../services/listingService';
import { Product, AdStatus } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { useAuth } from '../components/auth/AuthContext'; // Import useAuth

const EditListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser, isLoading: authIsLoading } = useAuth(); // Get current user

  const [initialProduct, setInitialProduct] = useState<Product | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authIsLoading) return; // Wait for auth state

    if (!currentUser) {
        setError("Пожалуйста, войдите в систему для редактирования объявления.");
        setIsLoading(false);
        // Optional: redirect to login after a delay or with a button
        // navigate('/login', { state: { from: location } });
        return;
    }

    if (!id) {
      setError("ID объявления не указан.");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const product = await listingService.getListingById(id);
        if (product && product.userId === currentUser.id) { 
          setInitialProduct(product);
        } else if (product && product.userId !== currentUser.id) {
           setError("У вас нет прав для редактирования этого объявления.");
        }
        else {
          setError("Объявление не найдено.");
        }
      } catch (err) {
        console.error("Failed to fetch product for editing:", err);
        setError("Не удалось загрузить объявление для редактирования.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, currentUser, authIsLoading, navigate]);

  const handleSubmit = async (productData: Product) => { 
    setIsSubmitting(true);
    setError(null);
    if (!initialProduct || !currentUser || initialProduct.userId !== currentUser.id) {
        setError("Ошибка прав доступа или данных объявления.");
        setIsSubmitting(false);
        return;
    }

    try {
      const updatedProductData: Product = {
        ...productData,
        status: (initialProduct.status === AdStatus.ACTIVE) 
                ? AdStatus.ACTIVE 
                : AdStatus.PENDING, 
      };

      await listingService.updateListing(initialProduct.id, updatedProductData);
      navigate(`/my-listings`);
    } catch (err) {
      console.error("Failed to update listing:", err);
      setError('Не удалось обновить объявление. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authIsLoading) return <Spinner fullPage />;
  
  if (!currentUser && !authIsLoading) { // If auth check complete and no user
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-8">
        {error || "Пожалуйста, войдите в систему."}
        <Button onClick={() => navigate('/login', { state: { from: location } })} className="mt-4">Войти</Button>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500 dark:text-red-400 p-8">{error} <Button onClick={() => navigate('/my-listings')}>К моим объявлениям</Button></div>;
  if (!initialProduct) return <div className="text-center text-slate-600 dark:text-slate-300 p-8">Объявление не найдено или у вас нет прав на его редактирование.</div>;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4">
        <i className="fa-solid fa-arrow-left mr-2"></i> Назад
      </Button>
      <ProductForm
        initialProduct={initialProduct}
        onSubmit={handleSubmit as (data: Omit<Product, 'id' | 'createdAt' | 'status' | 'userId'> | Product) => Promise<void>}
        isSubmitting={isSubmitting}
        submitButtonText="Сохранить изменения"
      />
      {error && !isSubmitting && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default EditListingPage;
