import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Package, Plus, Trash2, Globe, Smartphone, CheckCircle, XCircle, Calendar, Infinity, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { ref, get, set, remove } from 'firebase/database';
import { db, rtdb } from '../lib/firebase';

interface Product {
  id: string;
  productId: string;
  name: string;
  type: 'firebase' | 'domain';
  description: string;
  plans: Plan[];
}

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

interface LicenseData {
  projectIds?: string[];
  domains?: string[];
}

export const MyProductsPage: React.FC = () => {
  const { userData, refreshUserData } = useAuth();
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [licenses, setLicenses] = useState<Record<string, LicenseData>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [newProjectId, setNewProjectId] = useState('');
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    loadProducts();
  }, [userData]);

  const loadProducts = async () => {
    if (!userData?.products) {
      setLoading(false);
      return;
    }

    if (!rtdb) {
      toast.error(t('realtimeDatabaseNotConfigured'));
      setLoading(false);
      return;
    }

    try {
      const productsData: Product[] = [];
      const licensesData: Record<string, LicenseData> = {};

      for (const userProduct of userData.products) {
        // Find product by productId field (not document ID)
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('productId', '==', userProduct.productId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const product = { id: productDoc.id, ...productDoc.data() } as Product;
          productsData.push(product);

          // Load license data from Realtime Database based on product type
          // New structure:
          // - Apps: licenses/apps/{ProductID}/{ProjectID}/[data] - loaded when user enters ProjectID
          // - Domains: licenses/domains/{ProductID}/{PurchaseID}/[domains + data]
          
          if (product.type === 'domain' && userProduct.purchaseId) {
            // For domains: use purchaseId
            const licenseRef = ref(rtdb, `licenses/domains/${userProduct.productId}/${userProduct.purchaseId}`);
            const snapshot = await get(licenseRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              licensesData[userProduct.productId] = {
                isActive: data.isActive !== undefined ? data.isActive : true,
                domains: Array.isArray(data.domains) ? data.domains : []
              };
            } else {
              licensesData[userProduct.productId] = { 
                isActive: true,
                domains: [] 
              };
            }
          } else if (product.type === 'firebase') {
            // For Firebase apps: load only project IDs owned by current user
            const appLicenseRef = ref(rtdb, `licenses/apps/${userProduct.productId}`);
            const snapshot = await get(appLicenseRef);
            const projectIds: string[] = [];
            
            if (snapshot.exists()) {
              const projectsData = snapshot.val();
              // Filter ProjectIDs by owner
              Object.keys(projectsData).forEach(projectId => {
                const projectData = projectsData[projectId];
                // Check if this project belongs to the current user
                if (projectData.owner && projectData.owner.did === userData.uid) {
                  projectIds.push(projectId);
                }
              });
            }
            
            licensesData[userProduct.productId] = { 
              isActive: userProduct.isActive !== undefined ? userProduct.isActive : true,
              expiryType: userProduct.expiryType || 'lifetime',
              ...(userProduct.expiryDate && { expiryDate: userProduct.expiryDate }),
              projectIds
            };
          }
        }
      }

      setProducts(productsData);
      setLicenses(licensesData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(t('failedToLoadProducts'));
    } finally {
      setLoading(false);
    }
  };

  const addLicenseItem = async (productId: string, type: 'projectIds' | 'domains') => {
    if (!rtdb) {
      toast.error(t('realtimeDatabaseNotConfigured'));
      return;
    }

    try {
      const product = products.find(p => p.productId === productId);
      const userProduct = userData?.products.find(p => p.productId === productId);
      
      if (!product || !userProduct) return;

      if (product.type === 'firebase') {
        // For Firebase apps: add ProjectID
        if (!newProjectId.trim()) {
          toast.error(t('pleaseEnterProjectId'));
          return;
        }
        
        const projectId = newProjectId.trim();
        
        // Check if this project ID already exists
        const currentProjectIds = licenses[productId]?.projectIds || [];
        if (currentProjectIds.includes(projectId)) {
          toast.error(t('projectIdAlreadyExists'));
          return;
        }
        
        // Save to RTDB
        const licenseRef = ref(rtdb, `licenses/apps/${productId}/${projectId}`);
        const updatedData = {
          isActive: userProduct.isActive !== undefined ? userProduct.isActive : true,
          expiryType: userProduct.expiryType || 'lifetime',
          ...(userProduct.expiryDate && { expiryDate: userProduct.expiryDate }),
          designerSignatureVisible: userProduct.designerSignatureVisible !== undefined ? userProduct.designerSignatureVisible : true,
          owner: {
            did: userData?.uid || '',
            name: userData?.displayName || '',
            email: userData?.email || ''
          }
        };
        
        await set(licenseRef, updatedData);
        
        // Update local state
        setLicenses({
          ...licenses,
          [productId]: {
            ...licenses[productId],
            projectIds: [...currentProjectIds, projectId]
          }
        });
        
        setNewProjectId('');
        setDialogOpen(null);
        toast.success(t('addedSuccessfully'));
        
      } else if (product.type === 'domain') {
        // For domains: use purchaseId
        if (!userProduct.purchaseId) {
          toast.error(t('noPurchaseId'));
          return;
        }
        
        if (!newDomain.trim()) {
          toast.error(t('pleaseEnterDomain'));
          return;
        }
        
        const licenseRef = ref(rtdb, `licenses/domains/${productId}/${userProduct.purchaseId}`);
        const snapshot = await get(licenseRef);
        const existingData = snapshot.val() || {};
        const currentDomains = existingData.domains || [];
        
        // Check domain limit
        const allowedDomains = userProduct.allowedDomains || 0;
        if (currentDomains.length >= allowedDomains) {
          toast.error(`${t('maximumDomainsAllowed')} ${allowedDomains}`);
          return;
        }
        
        const updatedDomains = [...currentDomains, newDomain.trim()];
        const updatedData = {
          ...existingData, // Preserve existing data including owner
          isActive: userProduct.isActive !== undefined ? userProduct.isActive : true,
          domains: updatedDomains
        };
        
        await set(licenseRef, updatedData);
        
        setLicenses({
          ...licenses,
          [productId]: {
            ...licenses[productId],
            domains: updatedDomains
          }
        });
        
        setNewDomain('');
        setDialogOpen(null);
        toast.success(t('addedSuccessfully'));
      }
    } catch (error) {
      console.error('Error adding license item:', error);
      toast.error(t('failedToAddItem'));
    }
  };

  const removeLicenseItem = async (productId: string, type: 'projectIds' | 'domains', index: number) => {
    if (!rtdb) {
      toast.error(t('realtimeDatabaseNotConfigured'));
      return;
    }

    try {
      const product = products.find(p => p.productId === productId);
      const userProduct = userData?.products.find(p => p.productId === productId);
      
      if (!product || !userProduct) return;

      if (product.type === 'firebase' && type === 'projectIds') {
        // For Firebase apps: remove the project ID
        const currentProjectIds = licenses[productId]?.projectIds || [];
        const projectIdToRemove = currentProjectIds[index];
        
        if (!projectIdToRemove) return;
        
        const licenseRef = ref(rtdb, `licenses/apps/${productId}/${projectIdToRemove}`);
        
        // Remove the entire project node
        await remove(licenseRef);
        
        // Update local state
        const updatedProjectIds = currentProjectIds.filter((_, i) => i !== index);
        setLicenses({
          ...licenses,
          [productId]: {
            ...licenses[productId],
            projectIds: updatedProjectIds
          }
        });
        
        toast.success(t('removedSuccessfully'));
        
      } else if (product.type === 'domain' && type === 'domains') {
        // For domains: use purchaseId
        if (!userProduct.purchaseId) {
          toast.error(t('noPurchaseId'));
          return;
        }
        
        const licenseRef = ref(rtdb, `licenses/domains/${productId}/${userProduct.purchaseId}`);
        const snapshot = await get(licenseRef);
        const existingData = snapshot.val() || {};
        
        const currentDomains = existingData.domains || [];
        const updatedDomains = currentDomains.filter((_: string, i: number) => i !== index);
        
        const updatedData = {
          ...existingData,
          domains: updatedDomains
        };
        
        await set(licenseRef, updatedData);
        
        setLicenses({
          ...licenses,
          [productId]: {
            ...licenses[productId],
            domains: updatedDomains
          }
        });
        
        toast.success(t('removedSuccessfully'));
      }
    } catch (error) {
      console.error('Error removing license item:', error);
      toast.error(t('failedToRemoveItem'));
    }
  };

  const getUserPlan = (productId: string) => {
    return userData?.products.find(p => p.productId === productId)?.planId;
  };

  const getAllowedDomains = (productId: string) => {
    return userData?.products.find(p => p.productId === productId)?.allowedDomains || 0;
  };

  const getProductStatus = (productId: string) => {
    // Try to get from RTDB license data first (newer structure)
    const licenseData = licenses[productId];
    if (licenseData?.isActive !== undefined) {
      return {
        isActive: licenseData.isActive,
        expiryType: licenseData.expiryType || 'lifetime',
        expiryDate: licenseData.expiryDate
      };
    }
    
    // Fallback to Firestore data (for backward compatibility)
    const userProduct = userData?.products.find(p => p.productId === productId);
    return {
      isActive: userProduct?.isActive !== undefined ? userProduct.isActive : true,
      expiryType: userProduct?.expiryType || 'lifetime',
      expiryDate: userProduct?.expiryDate
    };
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
        <h1 className="text-3xl mb-2">{t('myProducts')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('manageProductsDescription')}
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
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => {
            const planId = getUserPlan(product.productId);
            const plan = product.plans.find(p => p.id === planId);
            const license = licenses[product.productId] || {};
            const allowedDomains = getAllowedDomains(product.productId);
            const status = getProductStatus(product.productId);
            const isExpired = status.expiryType === 'date' && status.expiryDate && new Date(status.expiryDate) < new Date();
            const showWarning = !status.isActive || isExpired;

            return (
              <Card key={product.id} className={showWarning ? 'border-red-300 dark:border-red-900' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {product.type === 'firebase' ? (
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Globe className="w-5 h-5 text-green-600" />
                      )}
                      <CardTitle>{product.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">{plan?.name || t('notAvailable')}</Badge>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                  
                  {/* Product Status */}
                  <div className="pt-2 space-y-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      {status.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">{t('active')}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 dark:text-red-400">{t('inactive')}</span>
                        </>
                      )}
                    </div>
                    
                    {product.type === 'firebase' && (
                      <div className="flex items-center gap-2 text-sm">
                        {status.expiryType === 'lifetime' ? (
                          <>
                            <Infinity className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">{t('lifetime')}</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className={isExpired ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                              {status.expiryDate ? new Date(status.expiryDate).toLocaleDateString() : t('notSet')}
                              {isExpired && ` (${t('expired')})`}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    
                    {showWarning && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {!status.isActive && t('productInactiveMessage')}
                          {isExpired && t('productExpiredMessage')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.type === 'firebase' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>{t('firebaseProjects')}</Label>
                          <p className="text-xs text-gray-500">
                            {license.projectIds?.length || 0} {t('projects')}
                          </p>
                        </div>
                        <Dialog open={dialogOpen === `${product.productId}-projectIds`} onOpenChange={(open) => setDialogOpen(open ? `${product.productId}-projectIds` : null)}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={showWarning}
                              title={showWarning ? t('productInactiveOrExpired') : ''}
                            >
                              <Plus className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {t('add')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('addProjectId')}</DialogTitle>
                              <DialogDescription>{t('addFirebaseProjectId')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>{t('firebaseProjectId')}</Label>
                                <Input
                                  placeholder="my-firebase-project"
                                  value={newProjectId}
                                  onChange={(e) => setNewProjectId(e.target.value)}
                                  dir="ltr"
                                  className="mt-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {t('enterProjectIdDesc')}
                                </p>
                              </div>
                              <Button onClick={() => addLicenseItem(product.productId, 'projectIds')} className="w-full">
                                {t('add')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="space-y-2">
                        {license.projectIds?.map((projectId, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm font-medium truncate flex-1" dir="ltr">{projectId}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLicenseItem(product.productId, 'projectIds', index)}
                              disabled={showWarning}
                              title={showWarning ? t('productInactiveOrExpired') : ''}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {(!license.projectIds || license.projectIds.length === 0) && (
                          <p className="text-sm text-gray-500">{t('noProjectsAdded')}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>{t('domains')}</Label>
                          <p className="text-xs text-gray-500">
                            {license.domains?.length || 0} / {allowedDomains} {t('used')}
                          </p>
                        </div>
                        <Dialog open={dialogOpen === `${product.productId}-domains`} onOpenChange={(open) => setDialogOpen(open ? `${product.productId}-domains` : null)}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={(license.domains?.length || 0) >= allowedDomains || showWarning}
                              title={showWarning ? t('productInactiveOrExpired') : ''}
                            >
                              <Plus className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {t('add')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('addDomain')}</DialogTitle>
                              <DialogDescription>{t('addDomainForLicense')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                placeholder="example.com"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                dir="ltr"
                              />
                              <Button onClick={() => addLicenseItem(product.productId, 'domains')} className="w-full">
                                {t('add')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="space-y-2">
                        {license.domains?.map((domain, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm truncate flex-1" dir="ltr">{domain}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLicenseItem(product.productId, 'domains', index)}
                              disabled={showWarning}
                              title={showWarning ? t('productInactiveOrExpired') : ''}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {(!license.domains || license.domains.length === 0) && (
                          <p className="text-sm text-gray-500">{t('noDomainsAdded')}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};