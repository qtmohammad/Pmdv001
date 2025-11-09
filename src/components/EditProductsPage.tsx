import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Trash2, Edit, Package, Globe, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUploader } from './ImageUploader';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

interface Product {
  id: string;
  name: string;
  productId?: string;
  type: 'firebase' | 'domain';
  description: string;
  plans: Plan[];
  iconUrl?: string;
  iconPublicId?: string;
  mainImageUrl?: string;
  mainImagePublicId?: string;
}

export const EditProductsPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    productId: '',
    type: 'firebase' as 'firebase' | 'domain',
    description: '',
    plans: [] as Plan[]
  });
  const [currentPlan, setCurrentPlan] = useState({
    name: '',
    price: '',
    features: ['']
  });
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  // Product images
  const [iconUrl, setIconUrl] = useState<string>('');
  const [iconPublicId, setIconPublicId] = useState<string>('');
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [mainImagePublicId, setMainImagePublicId] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(t('failedToLoadProducts'));
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      productId: product.productId || '',
      type: product.type,
      description: product.description,
      plans: product.plans
    });
    // Set image URLs
    setIconUrl(product.iconUrl || '');
    setIconPublicId(product.iconPublicId || '');
    setMainImageUrl(product.mainImageUrl || '');
    setMainImagePublicId(product.mainImagePublicId || '');
    // Reset plan editing state
    setEditingPlanId(null);
    setCurrentPlan({ name: '', price: '', features: [''] });
    setEditDialogOpen(true);
  };

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

  const addPlanToEdit = () => {
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

    setEditFormData({
      ...editFormData,
      plans: [...editFormData.plans, newPlan]
    });
    setCurrentPlan({ name: '', price: '', features: [''] });
    toast.success(t('planAdded'));
  };

  const removePlanFromEdit = (planId: string) => {
    setEditFormData({
      ...editFormData,
      plans: editFormData.plans.filter(p => p.id !== planId)
    });
  };

  const startEditingPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setCurrentPlan({
      name: plan.name,
      price: plan.price,
      features: [...plan.features]
    });
  };

  const saveEditedPlan = () => {
    if (!editingPlanId) return;
    
    if (!currentPlan.name || !currentPlan.price) {
      toast.error(t('fillPlanNameAndPrice'));
      return;
    }

    const updatedPlans = editFormData.plans.map(p => {
      if (p.id === editingPlanId) {
        return {
          ...p,
          name: currentPlan.name,
          price: currentPlan.price,
          features: currentPlan.features.filter(f => f.trim() !== '')
        };
      }
      return p;
    });

    setEditFormData({
      ...editFormData,
      plans: updatedPlans
    });
    
    setEditingPlanId(null);
    setCurrentPlan({ name: '', price: '', features: [''] });
    toast.success(t('planUpdated'));
  };

  const cancelEditingPlan = () => {
    setEditingPlanId(null);
    setCurrentPlan({ name: '', price: '', features: [''] });
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;

    if (editFormData.plans.length === 0) {
      toast.error(t('addAtLeastOnePlan'));
      return;
    }

    try {
      await updateDoc(doc(db, 'products', selectedProduct.id), {
        name: editFormData.name,
        type: editFormData.type,
        description: editFormData.description,
        plans: editFormData.plans,
        iconUrl: iconUrl || '',
        iconPublicId: iconPublicId || '',
        mainImageUrl: mainImageUrl || '',
        mainImagePublicId: mainImagePublicId || '',
        updatedAt: new Date().toISOString()
      });

      toast.success(t('productUpdatedSuccess'));
      setEditDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(t('failedToUpdateProduct'));
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(t('confirmDeleteProduct'))) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success(t('productDeletedSuccess'));
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('failedToDeleteProduct'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl mb-2">{t('editProducts')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('manageExistingProducts')}
        </p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('noProducts')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                {/* Product Icon Image */}
                {product.iconUrl && (
                  <div className="mb-3">
                    <img 
                      src={product.iconUrl} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {product.type === 'firebase' ? (
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-green-600" />
                    )}
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {product.type === 'firebase' ? t('firebase') : t('domain')}
                  </Badge>
                </div>
                {product.productId && (
                  <div className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">
                    ID: {product.productId}
                  </div>
                )}
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {product.plans.length} {t('plans')}
                  </p>
                  <div className="space-y-1">
                    {product.plans.map((plan) => (
                      <div key={plan.id} className="text-sm flex justify-between">
                        <span>{plan.name}</span>
                        <span className="text-gray-600" dir="ltr">{plan.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          // Reset editing state when dialog closes
          setEditingPlanId(null);
          setCurrentPlan({ name: '', price: '', features: [''] });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editProduct')}</DialogTitle>
            <DialogDescription>{t('updateProductDetails')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('productName')}</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              {editFormData.productId && (
                <div className="space-y-2">
                  <Label>{t('productId')}</Label>
                  <Input
                    value={editFormData.productId}
                    disabled
                    dir="ltr"
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('productIdDescription')}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('productType')}</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value: 'firebase' | 'domain') => setEditFormData({ ...editFormData, type: value })}
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
                <Label>{t('description')}</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
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
            </div>

            {/* Add/Edit Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingPlanId ? t('editPlan') : t('addNewPlan')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('plan')} {t('name')}</Label>
                    <Input
                      value={currentPlan.name}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                      placeholder={t('planNameShortPlaceholder')}
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
                      <Plus className="w-4 h-4" />
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

                {editingPlanId ? (
                  <div className="flex gap-2">
                    <Button type="button" onClick={saveEditedPlan} className="flex-1">
                      {t('saveChanges')}
                    </Button>
                    <Button type="button" onClick={cancelEditingPlan} variant="outline">
                      {t('cancel')}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={addPlanToEdit} variant="secondary" className="w-full">
                    <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('addPlan')}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Existing Plans */}
            {editFormData.plans.length > 0 && (
              <div className="space-y-3">
                <h4>{t('currentPlans')} ({editFormData.plans.length})</h4>
                {editFormData.plans.map((plan) => (
                  <div key={plan.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{plan.name}</span>
                        <span className="text-sm text-gray-600" dir="ltr">{plan.price}</span>
                      </div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditingPlan(plan)}
                        disabled={editingPlanId !== null}
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removePlanFromEdit(plan.id)}
                        disabled={editingPlanId !== null}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="flex-1">
                {t('updateProduct')}
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
