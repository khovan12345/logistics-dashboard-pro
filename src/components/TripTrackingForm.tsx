'use client';

import { ArrowLeft, Clock, Minus, Package, Plus, Save, Truck } from 'lucide-react';
import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  brand: string;
  size: 'S' | 'M' | 'L';
  quantity: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  packageType: 'carton' | 'bag_small' | 'bag_large';
}

interface TripFormData {
  vehicleId: string;
  driverName: string;
  route: string;
  products: Product[];
  estimatedCost: number;
  estimatedDistance: number;
  notes: string;
}

export default function TripTrackingForm() {
  const [formData, setFormData] = useState<TripFormData>({
    vehicleId: '',
    driverName: '',
    route: 'HCM → Đông Anh Hà Nội',
    products: [],
    estimatedCost: 0,
    estimatedDistance: 1540,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const brands = ['Heys', 'Larita', 'Pisani', 'Beatas', 'Austin Reed', 'Herschel'];
  const sizes = ['S', 'M', 'L'] as const;
  const packageTypes = [
    { value: 'carton', label: 'Thùng carton' },
    { value: 'bag_small', label: 'Bao nhỏ' },
    { value: 'bag_large', label: 'Bao lớn' },
  ] as const;

  const addProduct = () => {
    const newProduct: Product = {
      id: `product_${Date.now()}`,
      name: '',
      brand: brands[0],
      size: 'M',
      quantity: 1,
      weight: 2.5,
      dimensions: {
        length: 60,
        width: 40,
        height: 25,
      },
      packageType: 'carton',
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const removeProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
    }));
  };

  const calculateTotalProducts = () => {
    return formData.products.reduce((sum, product) => sum + product.quantity, 0);
  };

  const calculateTotalWeight = () => {
    return formData.products.reduce((sum, product) => sum + product.quantity * product.weight, 0);
  };

  const calculateTotalCBM = () => {
    return formData.products.reduce((sum, product) => {
      const cbm =
        (product.dimensions.length * product.dimensions.width * product.dimensions.height) /
        1000000;
      return sum + product.quantity * cbm;
    }, 0);
  };

  const estimateCost = () => {
    const totalWeight = calculateTotalWeight();
    const totalCBM = calculateTotalCBM();

    // Logic tính toán chi phí dựa trên trọng lượng và thể tích
    const costPerCBM = 300000; // 300k per m³
    const baseCost = totalCBM * costPerCBM;
    const weightFactor = totalWeight > 1000 ? 1.2 : 1.0;

    return Math.round(baseCost * weightFactor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.driverName || formData.products.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin chuyến xe');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const tripData = {
        id: `trip_${Date.now()}`,
        vehicleId: formData.vehicleId,
        driverName: formData.driverName,
        route: formData.route,
        status: 'started',
        products: formData.products,
        cost: formData.estimatedCost || estimateCost(),
        distance: formData.estimatedDistance,
        fuelConsumption: 0,
        startTime: new Date().toISOString(),
        notes: formData.notes,
      };

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          vehicleId: '',
          driverName: '',
          route: 'HCM → Đông Anh Hà Nội',
          products: [],
          estimatedCost: 0,
          estimatedDistance: 1540,
          notes: '',
        });

        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert('Lỗi khi ghi nhận chuyến xe: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting trip:', error);
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ghi nhận chuyến xe mới</h1>
          <p className="text-gray-600">Nhập thông tin chi tiết cho chuyến xe sắp khởi hành</p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Đã ghi nhận chuyến xe thành công!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Thông tin đã được lưu vào hệ thống và thông báo đã được gửi.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Trip Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Truck className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Thông tin chuyến xe</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã xe</label>
                <input
                  type="text"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ví dụ: 51H-12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên tài xế</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, driverName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Họ và tên tài xế"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tuyến đường</label>
                <input
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData((prev) => ({ ...prev, route: e.target.value }))}
                  placeholder="Nhập tuyến đường"
                  title="Tuyến đường"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quãng đường ước tính (km)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDistance}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedDistance: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="Nhập quãng đường (km)"
                  title="Quãng đường ước tính"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Danh sách sản phẩm</h2>
              </div>
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm sản phẩm
              </button>
            </div>

            {formData.products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có sản phẩm nào. Nhấn &ldquo;Thêm sản phẩm&rdquo; để bắt đầu.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.products.map((product, index) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">Sản phẩm {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        title="Xóa sản phẩm"
                        aria-label="Xóa sản phẩm"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tên sản phẩm
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tên sản phẩm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Thương hiệu
                        </label>
                        <select
                          value={product.brand}
                          onChange={(e) => updateProduct(product.id, { brand: e.target.value })}
                          title="Chọn thương hiệu"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Kích cỡ
                        </label>
                        <select
                          value={product.size}
                          onChange={(e) =>
                            updateProduct(product.id, { size: e.target.value as 'S' | 'M' | 'L' })
                          }
                          title="Chọn kích cỡ"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          {sizes.map((size) => (
                            <option key={size} value={size}>
                              Size {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Số lượng
                        </label>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) =>
                            updateProduct(product.id, { quantity: parseInt(e.target.value) || 1 })
                          }
                          placeholder="Nhập số lượng"
                          title="Số lượng sản phẩm"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Trọng lượng (kg)
                        </label>
                        <input
                          type="number"
                          value={product.weight}
                          onChange={(e) =>
                            updateProduct(product.id, { weight: parseFloat(e.target.value) || 0 })
                          }
                          placeholder="Nhập trọng lượng"
                          title="Trọng lượng sản phẩm"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Loại đóng gói
                        </label>
                        <select
                          value={product.packageType}
                          onChange={(e) =>
                            updateProduct(product.id, {
                              packageType: e.target.value as 'carton' | 'bag_small' | 'bag_large',
                            })
                          }
                          title="Chọn loại đóng gói"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          {packageTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Kích thước (cm)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={product.dimensions.length}
                            onChange={(e) =>
                              updateProduct(product.id, {
                                dimensions: {
                                  ...product.dimensions,
                                  length: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Dài"
                          />
                          <input
                            type="number"
                            value={product.dimensions.width}
                            onChange={(e) =>
                              updateProduct(product.id, {
                                dimensions: {
                                  ...product.dimensions,
                                  width: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Rộng"
                          />
                          <input
                            type="number"
                            value={product.dimensions.height}
                            onChange={(e) =>
                              updateProduct(product.id, {
                                dimensions: {
                                  ...product.dimensions,
                                  height: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Cao"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {formData.products.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Tóm tắt</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tổng sản phẩm:</span>
                    <div className="font-medium">{calculateTotalProducts().toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Tổng trọng lượng:</span>
                    <div className="font-medium">{calculateTotalWeight().toFixed(1)} kg</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Tổng CBM:</span>
                    <div className="font-medium">{calculateTotalCBM().toFixed(2)} m³</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Chi phí ước tính:</span>
                    <div className="font-medium text-blue-600">
                      {estimateCost().toLocaleString()} ₫
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white shadow rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ghi chú thêm về chuyến xe..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || formData.products.length === 0}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Ghi nhận chuyến xe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
