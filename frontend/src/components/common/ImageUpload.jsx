import React, { useState, useRef } from 'react';
import { Upload, X, Image, Plus } from 'lucide-react';

export const ImageUpload = ({ 
  label, 
  name, 
  images = [], 
  onImagesChange, 
  maxImages = 5,
  accept = "image/*",
  required = false 
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    onImagesChange([...images, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
    
    // Revoke object URL to prevent memory leaks
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-2">
            <div className="flex justify-center">
              {images.length === 0 ? (
                <Image className="h-12 w-12 text-gray-400" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {images.length === 0 ? 'Upload images' : 'Add more images'}
              </p>
              <p className="text-xs text-gray-500">
                Drag and drop or click to select • Max {maxImages} images
              </p>
              <p className="text-xs text-gray-400">
                {images.length > 0 && `${images.length}/${maxImages} uploaded`}
              </p>
            </div>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          The first image will be used as the main display image
        </p>
      )}
    </div>
  );
};