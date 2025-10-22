import React from 'react';
import { 
  Plus, 
  Minus, 
  DollarSign,
  FileText,
  UtensilsCrossed,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ImageUpload } from '../../common/ImageUpload';

export const MenusStep = ({ menus, onAddItem, onRemoveItem, onUpdateItem, menuImages, onMenuImagesChange }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Menu Items</h3>
          <p className="text-gray-600 mt-1">Add dishes and beverages to your restaurant menu</p>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <UtensilsCrossed className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h4>
          <p className="text-gray-600 mb-4">Start building your restaurant menu by adding your first item.</p>
          <button
            onClick={onAddItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Menu Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {menus.map((menu, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary-600" />
                  Menu Item {index + 1}
                </h4>
                <div className="flex items-center gap-2">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => onUpdateItem(index, 'available', !menu.available)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      menu.available 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {menu.available ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Available
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Unavailable
                      </>
                    )}
                  </button>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-colors text-xs"
                  >
                    <Minus className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Menu Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={menu.name}
                    onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                    placeholder="e.g., Grilled Chicken with Rice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Price (RWF) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={menu.price}
                      onChange={(e) => onUpdateItem(index, 'price', e.target.value)}
                      placeholder="5000"
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">RWF</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Description
                  </label>
                  <textarea
                    value={menu.description}
                    onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                    placeholder="Describe the dish, ingredients, cooking method, and any special features..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Menu Item Images */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                <p className="text-sm text-gray-600 mb-3">Add one appetizing photo of this dish</p>
                <ImageUpload
                  images={menuImages?.[index] || []}
                  onImagesChange={(newImages) => onMenuImagesChange(index, newImages)}
                  maxImages={1}
                  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                />
              </div>

              {/* Item Preview */}
              {(menu.name || menu.price) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <h6 className="text-sm font-medium text-gray-900 mb-1">Menu Preview:</h6>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{menu.name || 'Item Name'}</p>
                      {menu.description && (
                        <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">
                        {menu.price ? `${menu.price} RWF` : 'Price'}
                      </p>
                      <p className={`text-xs ${menu.available ? 'text-green-600' : 'text-red-600'}`}>
                        {menu.available ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Menu Summary */}
      {menus.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-blue-900 mb-2">Menu Summary</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-800 font-medium">Total Items</p>
              <p className="text-blue-900 text-lg font-bold">{menus.length}</p>
            </div>
            <div>
              <p className="text-blue-800 font-medium">Available</p>
              <p className="text-green-600 text-lg font-bold">
                {menus.filter(m => m.available !== false).length}
              </p>
            </div>
            <div>
              <p className="text-blue-800 font-medium">Price Range</p>
              <p className="text-blue-900 text-lg font-bold">
                {menus.length > 0 && menus.some(m => m.price) ? (
                  <>
                    {Math.min(...menus.filter(m => m.price).map(m => parseFloat(m.price) || 0))} - {' '}
                    {Math.max(...menus.filter(m => m.price).map(m => parseFloat(m.price) || 0))} RWF
                  </>
                ) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-blue-800 font-medium">Avg Price</p>
              <p className="text-blue-900 text-lg font-bold">
                {menus.length > 0 && menus.some(m => m.price) ? (
                  <>
                    {Math.round(
                      menus.filter(m => m.price).reduce((acc, m) => acc + (parseFloat(m.price) || 0), 0) / 
                      menus.filter(m => m.price).length
                    )} RWF
                  </>
                ) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};