import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File, commitMessage: string) => Promise<void>;
  isUploading: boolean;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isUploading, className = '' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCommitMessage(`Add ${file.name}`);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !commitMessage.trim()) return;

    try {
      setUploadStatus('idle');
      setErrorMessage('');
      await onUpload(selectedFile, commitMessage);
      setUploadStatus('success');
      setSelectedFile(null);
      setCommitMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setUploadStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setCommitMessage('');
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-purple-400 bg-purple-400/10'
            : selectedFile
            ? 'border-green-400/50 bg-green-400/5'
            : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <File className="w-8 h-8 text-green-400" />
              <div className="text-left">
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-purple-200 text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="p-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            {uploadStatus === 'success' && (
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">File uploaded successfully!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-purple-400 mx-auto" />
            <div>
              <p className="text-white font-medium">Drop a file here or click to browse</p>
              <p className="text-purple-200 text-sm mt-1">Maximum file size: 25MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Commit Message Input */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-purple-200">
            Commit Message
          </label>
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Describe your changes..."
            disabled={isUploading}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
          />

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={isUploading || !commitMessage.trim()}
            className="w-full px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default FileUploader;