import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (photo: File) => void;
  taskTitle: string;
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  onUpload,
  taskTitle,
}: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Photo Proof"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-medium-gray">
          Upload a photo to prove you completed "{taskTitle}"
        </p>

        {/* Upload Area */}
        {!preview ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerFileInput}
            className="border-2 border-dashed border-medium-gray rounded-lg p-8 text-center cursor-pointer hover:border-pastel-blue hover:bg-pastel-blue/5 transition-all"
          >
            <Camera className="h-12 w-12 mx-auto mb-3 text-medium-gray" />
            <p className="text-dark-slate font-medium mb-1">
              Click to upload photo
            </p>
            <p className="text-sm text-medium-gray">
              or drag and drop
            </p>
          </motion.div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
              className="absolute top-2 right-2 p-2 bg-dark-slate/50 rounded-full text-white hover:bg-dark-slate/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile}
            fullWidth
            leftIcon={preview ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          >
            {preview ? 'Confirm Upload' : 'Select Photo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}