"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronRight, FileCode, Folder, FolderOpen, Plus, Search, Trash2Icon, Edit, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import useFileStore, { FileNode } from "@/app/store/useFileStore";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FileExplorerItemProps {
  files: FileNode;
  level?: number;
  onFileSelect?: (file: FileNode) => void;
  onDeleteFile?: (file: FileNode) => void;
  onEditFile?: (file: FileNode) => void;
  selectedFile?: FileNode | null;
}

function FileExplorerItem({ files, level = 0, onFileSelect, onDeleteFile, onEditFile, selectedFile }: FileExplorerItemProps) {
  const [expanded, setExpanded] = useState(files.expanded || false);
  const [isHovered, setIsHovered] = useState(false);
  const user = useSession();

  const isSelected = selectedFile && selectedFile.name === files.name && selectedFile.type === files.type;

  if (files.type === "file") {
    return (
      <div
        className={`flex items-center gap-2 px-2.5 py-1.5 mx-1.5 mb-0.5 rounded-md cursor-pointer group transition-all duration-200 ${isSelected
            ? 'bg-emerald-500/15 text-emerald-400 font-medium shadow-sm'
            : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
          }`}
        style={{ paddingLeft: `${level * 8 + 8}px` }}
        onClick={() => onFileSelect && onFileSelect(files)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FileCode className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`} />
        <span className="text-sm truncate flex-grow">{files.name}</span>
        {isHovered && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEditFile && onEditFile(files);
              }}
              title="Edit File"
            >
              <Edit className="w-3.5 h-3.5 text-gray-400 hover:text-emerald-400 transition-colors" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile && onDeleteFile(files);
              }}
              title="Delete File"
            >
              <Trash2Icon className="w-3.5 h-3.5 text-gray-400 hover:text-red-400 transition-colors" />
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1.5 mx-1.5 mb-0.5 hover:bg-[#252525] text-gray-400 hover:text-gray-200 rounded-md cursor-pointer group transition-all duration-200"
        style={{ paddingLeft: `${level * 8 + 4}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {expanded ? <FolderOpen className="w-4 h-4 text-emerald-600" /> : <Folder className="w-4 h-4 text-emerald-600" />}
        <span className="text-sm font-medium">{files.name}</span>
      </div>
      {expanded && files.children?.map((child) => (
        <FileExplorerItem
          key={child.name}
          files={child}
          level={level + 1}
          onFileSelect={onFileSelect}
          onDeleteFile={onDeleteFile}
          onEditFile={onEditFile}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}

export default function FileExplorer({ onClose }: { onClose?: () => void }) {
  const {
    files,
    selectedFile,
    isLoading,
    fetchAllFiles,
    selectFile,
    createFile,
    deleteFile,
    editCurrentFile,
    hasFetchedInitialData
  } = useFileStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFileLimitModalOpen, setIsFileLimitModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileToDelete, setFileToDelete] = useState<FileNode | null>(null);
  const [fileToEdit, setFileToEdit] = useState<FileNode | null>(null);
  const session = useSession();
  const router = useRouter();

  const [localFiles, setLocalFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    if (session.status === 'authenticated') {
      if (!hasFetchedInitialData) {
        fetchAllFiles();
      }
    } else {
      // Initialize with local storage files for unauthenticated users
      const storedFiles = JSON.parse(localStorage.getItem('localFiles') || '[]');
      setLocalFiles(storedFiles);
    }
  }, [session.status, fetchAllFiles, hasFetchedInitialData]);

  // Loading states for operations
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateFile = async () => {
    if (!fileName.trim()) {
      toast.error("Please enter a file name!");
      return;
    }

    if (session.status !== 'authenticated') {
      const newFile: FileNode = {
        name: fileName,
        type: 'file',
        content: ''
      };

      const updatedFiles = [...localFiles, newFile];
      setLocalFiles(updatedFiles);
      localStorage.setItem('localFiles', JSON.stringify(updatedFiles));

      toast.success("File created locally!");
      setIsNewFileModalOpen(false);
      setFileName("");
      selectFile(newFile);
      return;
    }

    try {
      setIsCreating(true);
      await createFile(fileName);
      toast.success("File created successfully!");
      setIsNewFileModalOpen(false);
      setFileName("");
      fetchAllFiles();
    } catch (error: any) {
      if (error.status === 403) {
        setIsNewFileModalOpen(false);
        setIsFileLimitModalOpen(true);
      } else {
        toast.error("Failed to create file.");
        console.error("Error creating file:", error);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    if (session.status !== 'authenticated') {
      // Delete file locally for unauthenticated users
      const updatedFiles = localFiles.filter(f => f.name !== fileToDelete.name);
      setLocalFiles(updatedFiles);
      localStorage.setItem('localFiles', JSON.stringify(updatedFiles));

      toast.success("File deleted locally!");
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteFile(fileToDelete.name);
      toast.success("File deleted successfully!");
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
      fetchAllFiles();
    } catch (error) {
      toast.error("Failed to delete file.");
      console.error("Error deleting file:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditFile = async () => {
    if (!fileToEdit) {
      toast.error("No file selected for editing.");
      return;
    }

    if (!fileName.trim()) {
      toast.error("File name cannot be empty.");
      return;
    }

    if (session.status !== 'authenticated') {
      // Edit file locally for unauthenticated users
      const updatedFiles = localFiles.map(f =>
        f.name === fileToEdit.name
          ? { ...f, name: fileName }
          : f
      );

      setLocalFiles(updatedFiles);
      localStorage.setItem('localFiles', JSON.stringify(updatedFiles));

      toast.success(`File renamed to "${fileName}" locally!`);
      setIsEditModalOpen(false);
      setFileToEdit(null);
      setFileName("");
      return;
    }

    try {
      setIsEditing(true);
      await editCurrentFile(fileName, fileToEdit.name);
      toast.success(`File renamed to "${fileName}" successfully!`);
      setIsEditModalOpen(false);
      setFileToEdit(null);
      setFileName("");
      fetchAllFiles();
    } catch (error) {
      console.error("Error updating file:", error);
      toast.error("Failed to rename file.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileSelect = (file: FileNode) => {
    if (session.status !== 'authenticated') {
      // For guests, load content from localStorage directly
      const storedFiles = JSON.parse(localStorage.getItem('localFiles') || '[]');
      const localFile = storedFiles.find((f: any) => f.name === file.name);

      // Set the file in the store with its local content
      useFileStore.getState().setFileContent(localFile?.content || '');
      useFileStore.setState({ selectedFile: file, isDirty: false });
      onClose?.();
      return;
    }
    selectFile(file);
    onClose?.();
  };

  const initiateFileDelete = (file: FileNode) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const initiateFileEdit = (file: FileNode) => {
    setFileToEdit(file);
    setFileName(file.name);
    setIsEditModalOpen(true);
  };

  // Use local files for unauthenticated users, Zustand store files for authenticated
  const displayFiles = session.status === 'authenticated' ? files : localFiles;

  const filteredFiles = searchTerm.trim() === ""
    ? displayFiles
    : displayFiles.map(folder => {
      if (folder.type === "folder") {
        const filteredChildren = folder.children?.filter(file =>
          file.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
          ...folder,
          children: filteredChildren,
          expanded: filteredChildren && filteredChildren.length > 0 ? true : folder.expanded
        };
      }
      return folder;
    }).filter(folder =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (folder.children && folder.children.length > 0)
    );



  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] relative">
      <div className="px-4 py-3 flex justify-between items-center bg-[#1e1e1e] z-10 opacity-90 transition-opacity">
        <span className="text-gray-400 text-[11px] font-bold tracking-widest uppercase">Explorer</span>
        <div className="flex items-center gap-1.5">
          {session.status === 'authenticated' && (
            <span className="text-[10px] text-gray-500 mr-1 bg-[#252525] px-1.5 py-0.5 rounded-md">
              {files.length > 0 && files[0]?.children ? files[0].children.length : files.length}/5
            </span>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-gray-400 hover:text-emerald-400 hover:bg-[#252525] transition-colors rounded-md"
            onClick={() => setIsNewFileModalOpen(true)}
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </Button>
          {session.status === 'authenticated' && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-gray-400 hover:text-emerald-400 hover:bg-[#252525] transition-colors rounded-md"
              onClick={fetchAllFiles}
              disabled={isLoading}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <Input
            placeholder="Search files..."
            className="pl-9 bg-[#252525] border-transparent rounded-full focus:bg-[#2a2a2a] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-xs h-8 text-gray-200 placeholder:text-gray-500 transition-all duration-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 animate-pulse">
                <div className="w-4 h-4 rounded bg-gray-700" />
                <div className="h-3 rounded bg-gray-700 flex-1" style={{ width: `${50 + i * 15}%` }} />
              </div>
            ))}
          </div>
        ) : filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <FileExplorerItem
              key={file.name}
              files={file}
              onFileSelect={handleFileSelect}
              onDeleteFile={initiateFileDelete}
              onEditFile={initiateFileEdit}
              selectedFile={selectedFile}
            />
          ))
        ) : (
          <div className="flex flex-col items-center text-gray-500 p-6 text-sm">
            <FileCode className="w-8 h-8 mb-2 opacity-30" />
            <p className="mb-1">No files yet</p>
            <button
              className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
              onClick={() => setIsNewFileModalOpen(true)}
            >
              + Create your first file
            </button>
          </div>
        )}
      </ScrollArea>

      {/* Create File Dialog */}
      <Dialog open={isNewFileModalOpen} onOpenChange={setIsNewFileModalOpen}>
        <DialogContent className="bg-[#1e1e1e] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Create a New File</DialogTitle>
            <DialogDescription className="sr-only">
              Enter the name of the new file to create.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter file name (e.g. main.js)"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            autoFocus
            className="bg-[#252525] border-gray-800 text-white focus:border-emerald-600 focus:ring-emerald-600 focus:ring-opacity-20"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
              onClick={() => setIsNewFileModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFile}
              disabled={isCreating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit File Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#1e1e1e] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new name for "{fileToEdit?.name}"
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter new file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEditFile()}
            autoFocus
            className="bg-[#252525] border-gray-800 text-white focus:border-emerald-600 focus:ring-emerald-600 focus:ring-opacity-20"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditFile}
              disabled={isEditing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {isEditing ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1e1e1e] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFile}
              disabled={isDeleting}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Limit Exceeded Dialog */}
      <Dialog open={isFileLimitModalOpen} onOpenChange={setIsFileLimitModalOpen}>
        <DialogContent className="bg-[#1e1e1e] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">File Limit Reached</DialogTitle>
            <DialogDescription className="text-gray-400">
              You&apos;ve reached the maximum of 5 files on the free plan. Delete an existing file to create a new one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              onClick={() => setIsFileLimitModalOpen(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}