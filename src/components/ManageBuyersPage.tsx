import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Trash2, Edit, Users, Package, CheckCircle, XCircle, Calendar, Infinity } from 'lucide-react';
import { toast } from 'sonner';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, rtdb } from '../lib/firebase';
import { ref, set, get, remove } from 'firebase/database';

interface Buyer {
  id: string;
  name: string;
  email: string;
  products: UserProduct[];
  profileImage?: string | null;
  profileImagePublicId?: string | null;
  membershipType?: 'premium' | 'regular';
}

interface UserProduct {
  productId: string;
  planId: string;
  allowedDomains?: number;
  isActive?: boolean;
  expiryType?: 'lifetime' | 'date';
  expiryDate?: string;
  purchaseId?: string; // For domain products - unique purchase ID
  designerSignatureVisible?: boolean; // Designer signature visibility
}

interface Product {
  id: string;
  name: string;
  productId: string;
  type: 'firebase' | 'domain';
  plans: Plan[];
}

interface Plan {
  id: string;
  name: string;
  price: string;
}

export const ManageBuyersPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedUserProduct, setSelectedUserProduct] = useState<UserProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [assignData, setAssignData] = useState({
    productId: '',
    planId: '',
    allowedDomains: 1,
    isActive: true,
    designerSignatureVisible: true,
    expiryType: 'lifetime' as 'lifetime' | 'date',
    expiryDate: ''
  });
  const [editProductData, setEditProductData] = useState({
    planId: '',
    allowedDomains: 1,
    isActive: true,
    designerSignatureVisible: true,
    expiryType: 'lifetime' as 'lifetime' | 'date',
    expiryDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Generate unique purchase ID for domain products (10 chars: lowercase + numbers)
  const generatePurchaseId = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const loadData = async () => {
    try {
      // Load buyers
      const buyersSnapshot = await getDocs(collection(db, 'buyers'));
      const buyersData: Buyer[] = [];
      buyersSnapshot.forEach((doc) => {
        buyersData.push({ id: doc.id, ...doc.data() } as Buyer);
      });
      setBuyers(buyersData);

      // Load products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData: Product[] = [];
      productsSnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuyer = async () => {
    if (!formData.name || !formData.email) {
      toast.error(t('fillAllFields'));
      return;
    }

    try {
      await addDoc(collection(db, 'buyers'), {
        name: formData.name,
        email: formData.email,
        products: [],
        createdAt: new Date().toISOString()
      });

      toast.success(t('buyerAddedSuccess'));
      setAddDialogOpen(false);
      setFormData({ name: '', email: '' });
      loadData();
    } catch (error) {
      console.error('Error adding buyer:', error);
      toast.error(t('failedToAddBuyer'));
    }
  };

  const openEditDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setFormData({ name: buyer.name, email: buyer.email });
    setEditDialogOpen(true);
  };

  const handleUpdateBuyer = async () => {
    if (!selectedBuyer) return;

    try {
      await updateDoc(doc(db, 'buyers', selectedBuyer.id), {
        name: formData.name,
        email: formData.email,
        updatedAt: new Date().toISOString()
      });

      toast.success(t('buyerUpdatedSuccess'));
      setEditDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating buyer:', error);
      toast.error(t('failedToUpdateBuyer'));
    }
  };

  const handleDeleteBuyer = async (buyerId: string) => {
    if (!confirm(t('confirmDeleteBuyer'))) return;

    try {
      await deleteDoc(doc(db, 'buyers', buyerId));
      toast.success(t('buyerDeletedSuccess'));
      loadData();
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast.error(t('failedToDeleteBuyer'));
    }
  };

  const openAssignDialog = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setAssignData({ 
      productId: '', 
      planId: '', 
      allowedDomains: 1,
      isActive: true,
      designerSignatureVisible: true,
      expiryType: 'lifetime',
      expiryDate: ''
    });
    setAssignDialogOpen(true);
  };

  const handleAssignProduct = async () => {
    if (!selectedBuyer || !assignData.productId || !assignData.planId) {
      toast.error(t('fillAllFields'));
      return;
    }

    if (!rtdb) {
      toast.error(t('realtimeDatabaseNotConfigured'));
      return;
    }

    try {
      const existingProducts = selectedBuyer.products || [];
      
      // Check if product already assigned
      const productExists = existingProducts.some(p => p.productId === assignData.productId);
      if (productExists) {
        toast.error(t('productAlreadyAssigned'));
        return;
      }

      const selectedProduct = products.find(p => p.productId === assignData.productId);
      
      // For domain products, generate unique purchaseId
      const purchaseId = selectedProduct?.type === 'domain' ? generatePurchaseId() : undefined;
      
      const newProduct: UserProduct = {
        productId: assignData.productId,
        planId: assignData.planId,
        isActive: assignData.isActive,
        ...(selectedProduct?.type === 'domain' && { 
          allowedDomains: assignData.allowedDomains,
          purchaseId: purchaseId 
        }),
        ...(selectedProduct?.type === 'firebase' && {
          expiryType: assignData.expiryType,
          ...(assignData.expiryType === 'date' && { expiryDate: assignData.expiryDate })
        }),
        designerSignatureVisible: assignData.designerSignatureVisible
      };

      // Update Firestore
      await updateDoc(doc(db, 'buyers', selectedBuyer.id), {
        products: [...existingProducts, newProduct],
        updatedAt: new Date().toISOString()
      });

      // Save to Realtime Database - ONLY for domain products
      // For Firebase apps, data is saved when user enters ProjectID in MyProductsPage
      if (selectedProduct?.type === 'domain' && purchaseId) {
        const rtdbRef = ref(rtdb, `licenses/domains/${assignData.productId}/${purchaseId}`);
        const rtdbData = {
          isActive: assignData.isActive,
          designerSignatureVisible: assignData.designerSignatureVisible,
          domains: [],
          owner: {
            did: selectedBuyer.id,
            name: selectedBuyer.name,
            email: selectedBuyer.email
          }
        };
        await set(rtdbRef, rtdbData);
      }

      toast.success(t('productAssignedSuccess'));
      setAssignDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error assigning product:', error);
      toast.error(t('failedToAssignProduct'));
    }
  };

  const removeProductFromBuyer = async (buyerId: string, productId: string) => {
    if (!confirm(t('confirmRemoveProduct'))) return;

    if (!rtdb) {
      toast.error(t('realtimeDatabaseNotConfigured'));
      return;
    }

    try {
      const buyer = buyers.find(b => b.id === buyerId);
      if (!buyer) return;

      const product = products.find(p => p.productId === productId);
      const userProduct = buyer.products.find(p => p.productId === productId);
      
      const updatedProducts = buyer.products.filter(p => p.productId !== productId);
      
      // Update Firestore
      await updateDoc(doc(db, 'buyers', buyerId), {
        products: updatedProducts,
        updatedAt: new Date().toISOString()
      });

      // Remove from Realtime Database
      // For domains: use purchaseId, for apps: we don't store in RTDB until user adds ProjectID
      if (product?.type === 'domain' && userProduct?.purchaseId) {
        const rtdbRef = ref(rtdb, `licenses/domains/${productId}/${userProduct.purchaseId}`);
        await remove(rtdbRef);
      }
      // Note: For Firebase apps, we don't need to remove from RTDB as it's stored by ProjectID

      toast.success(t('productRemovedSuccess'));
      loadData();
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error(t('failedToRemoveProduct'));
    }
  };

  const openEditProductDialog = (buyer: Buyer, userProduct: UserProduct) => {
    setSelectedBuyer(buyer);
    setSelectedUserProduct(userProduct);
    setEditProductData({
      planId: userProduct.planId,
      allowedDomains: userProduct.allowedDomains || 1,
      isActive: userProduct.isActive !== undefined ? userProduct.isActive : true,
      designerSignatureVisible: userProduct.designerSignatureVisible !== undefined ? userProduct.designerSignatureVisible : true,
      expiryType: userProduct.expiryType || 'lifetime',
      expiryDate: userProduct.expiryDate || ''
    });
    setEditProductDialogOpen(true);
  };

  const handleUpdateProductDetails = async () => {
    if (!selectedBuyer || !selectedUserProduct || !editProductData.planId) {
      toast.error(t('fillAllFields'));
      return;
    }

    if (!rtdb) {
      toast.error(t('realtimeDatabaseNotConfigured'));
      return;
    }

    try {
      const buyer = buyers.find(b => b.id === selectedBuyer.id);
      if (!buyer) return;

      const product = products.find(prod => prod.id === selectedUserProduct.productId);
      
      const updatedProducts = buyer.products.map(p => {
        if (p.productId === selectedUserProduct.productId) {
          return {
            ...p,
            planId: editProductData.planId,
            isActive: editProductData.isActive,
            ...(product?.type === 'domain' && { allowedDomains: editProductData.allowedDomains }),
            ...(product?.type === 'firebase' && {
              expiryType: editProductData.expiryType,
              ...(editProductData.expiryType === 'date' && { expiryDate: editProductData.expiryDate })
            }),
            designerSignatureVisible: editProductData.designerSignatureVisible
          };
        }
        return p;
      });

      // Update Firestore
      await updateDoc(doc(db, 'buyers', selectedBuyer.id), {
        products: updatedProducts,
        updatedAt: new Date().toISOString()
      });

      // Update product status in Realtime Database - ONLY for domain products
      if (product?.type === 'domain' && selectedUserProduct.purchaseId) {
        const rtdbRef = ref(rtdb, `licenses/domains/${selectedUserProduct.productId}/${selectedUserProduct.purchaseId}`);
        
        // Get existing data to preserve domains
        const snapshot = await get(rtdbRef);
        const existingData = snapshot.val() || {};

        const rtdbData = {
          ...existingData,
          isActive: editProductData.isActive,
          designerSignatureVisible: editProductData.designerSignatureVisible
        };

        await set(rtdbRef, rtdbData);
      }
      // Note: For Firebase apps, status is managed per ProjectID by the user

      toast.success(t('productDetailsUpdatedSuccess'));
      setEditProductDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating product details:', error);
      toast.error(t('failedToUpdateProduct'));
    }
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.productId === productId)?.name || 'Unknown';
  };

  const getPlanName = (productId: string, planId: string) => {
    const product = products.find(p => p.productId === productId);
    return product?.plans.find(plan => plan.id === planId)?.name || 'Unknown';
  };

  const selectedProduct = products.find(p => p.productId === assignData.productId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">{t('manageBuyers')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('manageBuyersDescription')}
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('addBuyer')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('buyers')} ({buyers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {buyers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('noBuyersYet')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('buyer')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('products')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {buyer.profileImage ? (
                            <img
                              src={buyer.profileImage}
                              alt={buyer.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                              <span className="text-sm text-white">
                                {buyer.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{buyer.name}</div>
                            {buyer.membershipType && (
                              <Badge variant={buyer.membershipType === 'premium' ? 'default' : 'secondary'} className="text-xs">
                                {buyer.membershipType === 'premium' ? t('premiumMember') : t('regularMember')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell dir="ltr">{buyer.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {buyer.products?.length > 0 ? (
                            buyer.products.map((product, index) => {
                              const prod = products.find(p => p.id === product.productId);
                              const isExpired = product.expiryType === 'date' && product.expiryDate && new Date(product.expiryDate) < new Date();
                              const showExpired = isExpired || product.isActive === false;
                              
                              return (
                                <div key={index} className={`flex items-center gap-1 p-2 border rounded-lg ${showExpired ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1 text-sm">
                                      {getProductName(product.productId)}
                                      {product.isActive === false ? (
                                        <XCircle className="w-3 h-3 text-red-500" title={t('inactive')} />
                                      ) : product.isActive !== undefined && (
                                        <CheckCircle className="w-3 h-3 text-green-500" title={t('active')} />
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 space-y-0.5">
                                      <div>
                                        {getPlanName(product.productId, product.planId)}
                                        {prod?.type === 'domain' && ` • ${product.allowedDomains || 0} ${t('domains')}`}
                                      </div>
                                      {prod?.type === 'firebase' && product.expiryType && (
                                        <div className="flex items-center gap-1">
                                          {product.expiryType === 'lifetime' ? (
                                            <>
                                              <Infinity className="w-3 h-3" />
                                              <span>{t('lifetime')}</span>
                                            </>
                                          ) : (
                                            <>
                                              <Calendar className="w-3 h-3" />
                                              <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                                                {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : t('notSet')}
                                                {isExpired && ` (${t('expired')})`}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEditProductDialog(buyer, product)}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-blue-600"
                                      title={t('edit')}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeProductFromBuyer(buyer.id, product.productId)}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600"
                                      title={t('delete')}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-sm text-gray-500">{t('noProductsAssigned')}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                        <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignDialog(buyer)}
                          >
                            <Package className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {t('assign')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(buyer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBuyer(buyer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Buyer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addBuyer')}</DialogTitle>
            <DialogDescription>{t('addNewBuyer')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('emailPlaceholder')}
                dir="ltr"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddBuyer} className="flex-1">
                {t('add')}
              </Button>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Buyer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editBuyer')}</DialogTitle>
            <DialogDescription>{t('updateBuyerInfo')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateBuyer} className="flex-1">
                {t('update')}
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Product Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('assignProducts')}</DialogTitle>
            <DialogDescription>
              {t('assignProductTo')} {selectedBuyer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('productName')}</Label>
              <Select
                value={assignData.productId}
                onValueChange={(value) => setAssignData({ ...assignData, productId: value, planId: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectProduct')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.productId}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {assignData.productId && (
              <div className="space-y-2">
                <Label>{t('plan')}</Label>
                <Select
                  value={assignData.planId}
                  onValueChange={(value) => setAssignData({ ...assignData, planId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPlan')} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedProduct?.type === 'domain' && assignData.planId && (
              <div className="space-y-2">
                <Label>{t('allowedDomains')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={assignData.allowedDomains}
                  onChange={(e) => setAssignData({ ...assignData, allowedDomains: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}

            {assignData.planId && (
              <div className="space-y-2">
                <Label>{t('productStatus')}</Label>
                <Select
                  value={assignData.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => setAssignData({ ...assignData, isActive: value === 'active' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {assignData.planId && (
              <div className="space-y-2">
                <Label>{t('designerSignature')}</Label>
                <Select
                  value={assignData.designerSignatureVisible ? 'visible' : 'hidden'}
                  onValueChange={(value) => setAssignData({ ...assignData, designerSignatureVisible: value === 'visible' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">{t('visible')}</SelectItem>
                    <SelectItem value="hidden">{t('hidden')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedProduct?.type === 'firebase' && assignData.planId && (
              <>
                <div className="space-y-2">
                  <Label>{t('validity')}</Label>
                  <Select
                    value={assignData.expiryType}
                    onValueChange={(value: 'lifetime' | 'date') => setAssignData({ ...assignData, expiryType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifetime">{t('lifetime')}</SelectItem>
                      <SelectItem value="date">{t('specificDate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {assignData.expiryType === 'date' && (
                  <div className="space-y-2">
                    <Label>{t('expiryDate')}</Label>
                    <Input
                      type="date"
                      value={assignData.expiryDate}
                      onChange={(e) => setAssignData({ ...assignData, expiryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAssignProduct} className="flex-1">
                {t('assign')}
              </Button>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Details Dialog */}
      <Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editProductDetails')}</DialogTitle>
            <DialogDescription>
              {t('updateProductDetailsFor')} {selectedBuyer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('productName')}</Label>
              <Input
                value={getProductName(selectedUserProduct?.productId || '')}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('currentPlan')}</Label>
              <Input
                value={getPlanName(selectedUserProduct?.productId || '', selectedUserProduct?.planId || '')}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('newPlan')}</Label>
              <Select
                value={editProductData.planId}
                onValueChange={(value) => setEditProductData({ ...editProductData, planId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectPlan')} />
                </SelectTrigger>
                <SelectContent>
                  {products.find(p => p.id === selectedUserProduct?.productId)?.plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {products.find(p => p.id === selectedUserProduct?.productId)?.type === 'domain' && (
              <div className="space-y-2">
                <Label>{t('allowedDomains')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={editProductData.allowedDomains}
                  onChange={(e) => setEditProductData({ ...editProductData, allowedDomains: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}

            {products.find(p => p.id === selectedUserProduct?.productId)?.type === 'domain' && (
              <div className="space-y-2">
                <Label>{t('designerSignature')}</Label>
                <Select
                  value={editProductData.designerSignatureVisible ? 'visible' : 'hidden'}
                  onValueChange={(value) => setEditProductData({ ...editProductData, designerSignatureVisible: value === 'visible' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">{t('visible')}</SelectItem>
                    <SelectItem value="hidden">{t('hidden')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('productStatus')}</Label>
              <Select
                value={editProductData.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => setEditProductData({ ...editProductData, isActive: value === 'active' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {products.find(p => p.id === selectedUserProduct?.productId)?.type === 'firebase' && (
              <>
                <div className="space-y-2">
                  <Label>{t('designerSignature')}</Label>
                  <Select
                    value={editProductData.designerSignatureVisible ? 'visible' : 'hidden'}
                    onValueChange={(value) => setEditProductData({ ...editProductData, designerSignatureVisible: value === 'visible' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">{t('visible')}</SelectItem>
                      <SelectItem value="hidden">{t('hidden')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('validity')}</Label>
                  <Select
                    value={editProductData.expiryType}
                    onValueChange={(value: 'lifetime' | 'date') => setEditProductData({ ...editProductData, expiryType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifetime">{t('lifetime')}</SelectItem>
                      <SelectItem value="date">{t('specificDate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editProductData.expiryType === 'date' && (
                  <div className="space-y-2">
                    <Label>{t('expiryDate')}</Label>
                    <Input
                      type="date"
                      value={editProductData.expiryDate}
                      onChange={(e) => setEditProductData({ ...editProductData, expiryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpdateProductDetails} className="flex-1">
                {t('update')}
              </Button>
              <Button variant="outline" onClick={() => setEditProductDialogOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};