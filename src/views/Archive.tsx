import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Download, 
  Trash2, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  X
} from 'lucide-react';
import { ArchiveDocument } from '../types';
import { cn } from '../lib/utils';

interface ArchiveProps {
  docs: ArchiveDocument[];
  onAddDoc: (doc: Omit<ArchiveDocument, 'id'>) => void;
  onDeleteDoc: (id: string) => void;
}

export const Archive: React.FC<ArchiveProps> = ({ docs, onAddDoc, onDeleteDoc }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteDoc(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setUploadFile(files[0]);
      if (!uploadTitle) setUploadTitle(files[0].name.split('.')[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
      if (!uploadTitle) setUploadTitle(e.target.files[0].name.split('.')[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadFile || !uploadTitle) {
      alert('파일과 제목을 모두 입력해주세요.');
      return;
    }

    const newDoc: Omit<ArchiveDocument, 'id'> = {
      title: uploadTitle,
      uploadDate: new Date().toISOString().split('T')[0],
      instructor: 'Lee, Seong-ho (I-082)',
      sector: 'GND', // Default or random
      thumbnail: uploadFile.type.startsWith('image/') 
        ? URL.createObjectURL(uploadFile) 
        : 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80&w=400',
      type: uploadFile.type.includes('pdf') ? 'PDF' : 'IMG'
    };

    onAddDoc(newDoc);
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadTitle('');
    alert('자료가 성공적으로 업로드되었습니다.');
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSector = selectedSector === 'All Sectors' || doc.sector === selectedSector;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">자료실</h2>
          <p className="text-slate-500 mt-2">과거 역량 평가 결과 및 스캔된 문서를 관리하고 검토합니다.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-[#0e5c8e] hover:bg-[#0a4a75] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95 group shrink-0"
        >
          <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          신규 자료 업로드
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Date Range & Sector Filters */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">기간 설정</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span>2023-01-01 - 2023-12-31</span>
              </div>
            </div>


          </div>

          {/* Search and View Mode */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="자료 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
              />
            </div>

            <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {/* Upload Card */}
        {viewMode === 'grid' && (
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all group min-h-[380px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
            </div>
            <h4 className="font-bold text-slate-800">자료 업로드</h4>
            <p className="text-xs text-slate-500 mt-2 text-center">PDF, JPEG, PNG 파일<br />최대 20MB</p>
          </button>
        )}

        {/* Document Cards */}
        {filteredDocs.map((doc) => (
          <div 
            key={doc.id}
            className={cn(
              "bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex",
              viewMode === 'grid' ? "flex-col" : "flex-row items-center p-4 gap-6"
            )}
          >
            <div className={cn(
              "relative",
              viewMode === 'grid' ? "aspect-[4/3] w-full" : "w-48 h-32 shrink-0 rounded-xl overflow-hidden"
            )}>
              <img 
                src={doc.thumbnail} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={doc.title}
                referrerPolicy="no-referrer"
              />

            </div>

            <div className={cn(
              "p-5 flex-1 flex flex-col",
              viewMode === 'grid' ? "" : "justify-between"
            )}>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {doc.title}
                </h4>
                <div className="mt-4 grid grid-cols-2 gap-y-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">업로드 일자</p>
                    <p className="text-sm font-semibold text-slate-700">{doc.uploadDate}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">담당 교관</p>
                    <p className="text-sm font-semibold text-slate-700">{doc.instructor}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  {doc.type === 'PDF' ? (
                    <><Eye className="w-3.5 h-3.5" /> 상세보기</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> 다운로드</>
                  )}
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium">총 {docs.length}개의 자료 중 {filteredDocs.length}개 표시 중</p>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(page => (
              <button 
                key={page}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  page === 1 ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {page}
              </button>
            ))}
            <span className="text-slate-400 px-1">...</span>
            <button className="w-8 h-8 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50">32</button>
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload Modal Implementation */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">새로운 자료 업로드</h3>
                  <p className="text-xs text-slate-500 font-medium">평가 결과 또는 주요 문서를 디지털 아카이브에 보관합니다.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadTitle('');
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,image/*"
              />
              <div 
                id="drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center group transition-all cursor-pointer",
                  isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30",
                  uploadFile ? "border-emerald-400 bg-emerald-50/20" : ""
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                  uploadFile ? "bg-emerald-50" : "bg-slate-50"
                )}>
                  {uploadFile ? (
                    <FileText className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <p className="text-sm font-bold text-slate-600 text-center">
                  {uploadFile ? uploadFile.name : "파일을 드래그하거나 클릭하여 선택하세요"}
                </p>
                <p className="text-xs text-slate-400 mt-2">PDF, JPEG, PNG (최대 20MB)</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">자료 제목</label>
                <input 
                  type="text" 
                  placeholder="제목 입력..." 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" 
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadTitle('');
                }}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={!uploadFile}
                className={cn(
                  "px-10 py-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 text-nowrap",
                  !uploadFile ? "bg-slate-300 text-slate-100 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                )}
              >
                업로드 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">자료 삭제</h3>
              <p className="text-sm text-slate-500 mt-2">
                정말로 이 자료를 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all"
              >
                취소
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
