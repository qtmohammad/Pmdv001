import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUploader } from './ImageUploader';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export const AddProductsPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    type: 'firebase' as 'firebase' | 'domain',
    description: ''
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState({
    name: '',
    price: '',
    features: ['']
  });
  const [loading, setLoading] = useState(false);
  
  // Product images
  const [iconUrl, setIconUrl] = useState<string>('');
  const [iconPublicId, setIconPublicId] = useState<string>('');
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [mainImagePublicId, setMainImagePublicId] = useState<string>('');

  const addFeature = () => {
    setCurrentPlan({
      ...currentPlan,
      features: [...currentPlan.features, '']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...currentPlan.features];
    newFeatures[index] = value;
    setCurrentPlan({ ...currentPlan, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    setCurrentPlan({
      ...currentPlan,
      features: currentPlan.features.filter((_, i) => i !== index)
    });
  };

  const addPlan = () => {
    if (!currentPlan.name || !currentPlan.price) {
      toast.error(t('fillPlanNameAndPrice'));
      return;
    }

    const newPlan: Plan = {
      id: Date.now().toString(),
      name: currentPlan.name,
      price: currentPlan.price,
      features: currentPlan.features.filter(f => f.trim() !== '')
    };

    setPlans([...plans, newPlan]);
    setCurrentPlan({ name: '', price: '', features: [''] });
    toast.success(t('planAdded'));
  };

  const removePlan = (planId: string) => {
    setPlans(plans.filter(p => p.id !== planId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId.trim()) {
      toast.error(t('productIdRequired'));
      return;
    }

    if (plans.length === 0) {
      toast.error(t('addAtLeastOnePlan'));
      return;
    }

    setLoading(true);

    try {
      // Check if product ID already exists
      const q = query(collection(db, 'products'), where('productId', '==', formData.productId.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        toast.error(t('productIdExists'));
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'products'), {
        name: formData.name,
        productId: formData.productId.trim(),
        type: formData.type,
        description: formData.description,
        plans: plans,
        iconUrl: iconUrl || '',
        iconPublicId: iconPublicId || '',
        mainImageUrl: mainImageUrl || '',
        mainImagePublicId: mainImagePublicId || '',
        createdAt: new Date().toISOString()
      });

      toast.success(t('productAddedSuccess'));
      setFormData({ name: '', productId: '', type: 'firebase', description: '' });
      setPlans([]);
      setCurrentPlan({ name: '', price: '', features: [''] });
      setIconUrl('');
      setIconPublicId('');
      setMainImageUrl('');
      setMainImagePublicId('');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(t('failedToAddProduct'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl mb-2">{t('addProducts')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('createProductsDescription')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t('productDetails')}</CardTitle>
            <CardDescription>{t('basicProductInfo')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('productName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">{t('productId')}</Label>
              <Input
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                placeholder={t('productIdPlaceholder')}
                dir="ltr"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('productIdDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t('productType')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'firebase' | 'domain') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firebase">{t('firebaseApp')}</SelectItem>
                  <SelectItem value="domain">{t('domainLicense')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {/* Product Icon */}
            <div className="space-y-2">
              <ImageUploader
                currentImage={iconUrl}
                onImageUpload={(url, publicId) => {
                  setIconUrl(url);
                  setIconPublicId(publicId);
                }}
                onImageRemove={() => {
                  setIconUrl('');
                  setIconPublicId('');
                }}
                label={t('productIcon')}
                folder="products/icons"
                aspectRatio="square"
                maxSizeMB={2}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('productIconDescription')}
              </p>
            </div>

            {/* Product Main Image */}
            <div className="space-y-2">
              <ImageUploader
                currentImage={mainImageUrl}
                onImageUpload={(url, publicId) => {
                  setMainImageUrl(url);
                  setMainImagePublicId(publicId);
                }}
                onImageRemove={() => {
                  setMainImageUrl('');
                  setMainImagePublicId('');
                }}
                label={t('productMainImage')}
                folder="products/main-images"
                aspectRatio="landscape"
                maxSizeMB={5}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('productMainImageDescription')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add Plan */}
        <Card>
          <CardHeader>
            <CardTitle>{t('addPlan')}</CardTitle>
            <CardDescription>{t('createPricingPlans')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('plan')} {t('name')}</Label>
                <Input
                  value={currentPlan.name}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                  placeholder={t('planNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('price')}</Label>
                <Input
                  value={currentPlan.price}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, price: e.target.value })}
                  placeholder="$99"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('features')}</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                  <Plus className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t('addFeature')}
                </Button>
              </div>
              <div className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder={t('featurePlaceholder')}
                    />
                    {currentPlan.features.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button type="button" onClick={addPlan} variant="secondary" className="w-full">
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('addThisPlan')}
            </Button>
          </CardContent>
        </Card>

        {/* Plans List */}
        {plans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('addedPlans')} ({plans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4>{plan.name}</h4>
                        <span className="text-sm text-gray-600" dir="ltr">{plan.price}</span>
                      </div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removePlan(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          <Package className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {loading ? '...' : t('createProduct')}
        </Button>
      </form>
    </div>
  );
};