import React, { useRef, useState } from 'react';
import { Upload, X, ArrowRight, Loader2, ImagePlus } from 'lucide-react';

export default function CardUploader({ onScan, isScanning }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (incomingFiles) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const newFiles = Array.from(incomingFiles).filter(file => 
      validTypes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)
    );

    if (newFiles.length === 0) return;

    const combinedFiles = [...files, ...newFiles].slice(0, 2);
    setFiles(combinedFiles);

    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const clearAll = () => {
    setFiles([]);
    setPreviews([]);
  };

  const handleTriggerScan = () => {
    if (files.length > 0 && !isScanning) {
      onScan(files);
    }
  };

  return (
    <div id="uploader" className="bg-pure border border-hairline rounded-md p-6 sm:p-8 shadow-subtle-2 space-y-6">
      
      {/* Clean Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <h2 className="text-xl font-sans font-medium text-obsidian tracking-tight">
          Upload Business Card
        </h2>
        <div className="flex items-center gap-3 font-mono text-xs text-stone">
          <span>{files.length}/2 Files</span>
          {files.length > 0 && (
            <button
              onClick={clearAll}
              disabled={isScanning}
              className="hover:text-obsidian underline uppercase text-[11px] disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Zone */}
      {files.length < 2 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-obsidian bg-hairline/30'
              : 'border-hairline hover:border-graphite bg-paper'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-pure border border-hairline shadow-subtle-2">
              <Upload className="w-5 h-5 text-obsidian" />
            </div>
            <div>
              <p className="text-sm font-sans font-medium text-obsidian">
                Drag and drop card images here, or click to browse
              </p>
              <p className="text-xs text-stone font-sans mt-1">
                Upload Front & Back (JPG, PNG, HEIC, WEBP)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {files.map((file, idx) => (
            <div key={idx} className="relative border border-hairline rounded-md p-3 bg-paper flex items-center gap-4">
              <div className="w-20 h-14 bg-pure rounded border border-hairline overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img
                  src={previews[idx]}
                  alt={`Card preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] text-stone uppercase tracking-wider block">
                  {idx === 0 ? 'Front Image' : 'Back Image'}
                </span>
                <p className="text-xs font-sans font-medium text-obsidian truncate">
                  {file.name}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                disabled={isScanning}
                className="p-1 rounded text-stone hover:text-obsidian hover:bg-hairline/60 transition-colors disabled:opacity-50"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {files.length === 1 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-hairline rounded-md p-3 bg-paper hover:bg-pure flex items-center justify-center gap-2 cursor-pointer transition-colors text-stone hover:text-obsidian"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="text-xs font-sans font-medium">
                Add Back Image
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleTriggerScan}
          disabled={files.length === 0 || isScanning}
          className="flex items-center gap-2 px-6 py-2.5 rounded bg-obsidian text-pure font-sans text-xs font-medium hover:bg-carbon disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-subtle"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Card...</span>
            </>
          ) : (
            <>
              <span>Scan Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
