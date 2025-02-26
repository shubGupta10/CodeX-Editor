"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronRight, FileCode, Folder, FolderOpen, Plus, Search, Trash2Icon, Edit } from "lucide-react";
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
        className={`flex items-center gap-2 px-2 py-1.5 hover:bg-[#2a2d2e] ${isSelected ? 'bg-[#37373d]' : ''} text-gray-300 hover:text-white rounded cursor-pointer group`}
        style={{ paddingLeft: `${level * 8 + 8}px` }}
        onClick={() => onFileSelect && onFileSelect(files)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FileCode className="w-4 h-4 text-gray-400" />
        <span className="text-sm truncate flex-grow">{files.name}</span>
        {isHovered && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onEditFile && onEditFile(files);
              }}
              title="Edit File"
            >
              <Edit className="w-3.5 h-3.5 hover:text-black" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile && onDeleteFile(files);
              }}
              title="Delete File"
            >
              <Trash2Icon className="w-3.5 h-3.5  hover:text-red-400" />
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2d2e] text-gray-300 hover:text-white rounded cursor-pointer group"
        style={{ paddingLeft: `${level * 8 + 4}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {expanded ? <FolderOpen className="w-4 h-4 text-[#dcb67a]" /> : <Folder className="w-4 h-4 text-[#dcb67a]" />}
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

export default function FileExplorer() {
  // Use the Zustand store
  const { 
    files, 
    selectedFile, 
    isLoading, 
    fetchAllFiles, 
    selectFile, 
    createFile, 
    deleteFile,
    editCurrentFile
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

  const handleCreateFile = async () => {
    if (!fileName.trim()) {
      toast.error("Please enter a file name!");
      return;
    }

    try {
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
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
  
    try {
      await deleteFile(fileToDelete.name);
      toast.success("File deleted successfully!");
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
      fetchAllFiles();
    } catch (error) {
      toast.error("Failed to delete file.");
      console.error("Error deleting file:", error);
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
  
    try {
      await editCurrentFile(fileName, fileToEdit.name);
      toast.success(`File renamed to "${fileName}" successfully!`);
      setIsEditModalOpen(false);
      setFileToEdit(null);
      setFileName("");
      fetchAllFiles();
    } catch (error) {
      console.error("Error updating file:", error);
      toast.error("Failed to rename file.");
    }
  };

  const handleFileSelect = (file: FileNode) => {
    selectFile(file);
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

  const filteredFiles = searchTerm.trim() === "" 
    ? files 
    : files.map(folder => {
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

  useEffect(() => {
    fetchAllFiles();
  }, [fetchAllFiles]);

  return (
    <div className="h-full flex flex-col bg-[#252526]">
      {session.status === 'authenticated' ? (
        <>
          <div className="p-2 border-b border-[#1e1e1e] flex justify-between items-center">
            <span className="text-gray-300 text-sm font-medium">EXPLORER</span>
            <div className="flex gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6" 
                onClick={() => setIsNewFileModalOpen(true)}
                title="New File"
              >
                <Plus className="w-3.5 h-3.5 hover:text-black" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6" 
                onClick={fetchAllFiles} 
                disabled={isLoading}
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gray-400 hover:text-black" : "text-gray-100 hover:text-black"}`} />
              </Button>
            </div>
          </div>

          <div className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                className="h-7 pl-8 text-sm bg-[#3c3c3c] border-[#3c3c3c] text-gray-300 placeholder:text-gray-500"
                placeholder="Search files"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            {filteredFiles.length > 0 ? (
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
              <div className="text-center text-gray-500 p-4 text-sm">
                {isLoading ? "Loading files..." : "No files found"}
              </div>
            )}
          </ScrollArea>

          {/* Create File Dialog */}
          <Dialog open={isNewFileModalOpen} onOpenChange={setIsNewFileModalOpen}>
            <DialogContent className="bg-[#252526] text-white border-[#3c3c3c]">
              <DialogHeader>
                <DialogTitle>Create a New File</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                placeholder="Enter file name (e.g. main.js)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-[#3c3c3c] border-[#2d2d2d] text-white"
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsNewFileModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateFile}
                  className="bg-[#0e639c] hover:bg-[#1177bb] text-white"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit File Dialog */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="bg-[#252526] text-white border-[#3c3c3c]">
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
                className="bg-[#3c3c3c] border-[#2d2d2d] text-white"
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleEditFile}
                  className="bg-[#0e639c] hover:bg-[#1177bb] text-white"
                >
                  Rename
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete File Confirmation Dialog */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="bg-[#252526] text-white border-[#3c3c3c]">
              <DialogHeader>
                <DialogTitle>Delete File</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleDeleteFile}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* File Limit Reached Dialog */}
          <Dialog open={isFileLimitModalOpen} onOpenChange={setIsFileLimitModalOpen}>
            <DialogContent className="bg-[#252526] text-white border-[#3c3c3c]">
              <DialogHeader>
                <DialogTitle>File Limit Reached</DialogTitle>
                <DialogDescription className="text-gray-400">
                  You have reached your limit of 5 files. Please delete an existing file before creating a new one.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  onClick={() => setIsFileLimitModalOpen(false)}
                  className="bg-[#0e639c] hover:bg-[#1177bb] text-white"
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-4 text-gray-300">
          <h1 className="text-xl font-semibold mb-4">Sign in to save files</h1>
          <Button className="bg-[#0e639c] hover:bg-[#1177bb] text-white">Login Now</Button>
        </div>
      )}
    </div>
  );
}