import { create } from 'zustand';

export interface FileNode {
  name: string;
  type: "file" | "folder";
  expanded?: boolean;
  children?: FileNode[];
  language?: string;
  content?: string;
}

interface FileStore {
  // State
  files: FileNode[];
  selectedFile: FileNode | null;
  fileContent: string;
  isLoading: boolean;
  isDirty: boolean;
  contentCache: Map<string, string>;
  hasFetchedInitialData: boolean;
  
  // Actions
  setFiles: (files: FileNode[]) => void;
  selectFile: (file: FileNode | null) => void;
  setFileContent: (content: string) => void;
  createFile: (fileName: string, language?: string) => Promise<void>;
  deleteFile: (fileName: string) => Promise<void>;
  editCurrentFile: (newFileName: string, oldFileName: string) => Promise<void>;
  loadFileContent: (fileName: string) => Promise<void>;
  saveFileContent: () => Promise<void>;
  fetchAllFiles: () => Promise<void>;
  setIsDirty: (isDirty: boolean) => void;
}

const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  selectedFile: null,
  fileContent: "",
  isLoading: false,
  isDirty: false,
  contentCache: new Map(),
  hasFetchedInitialData: false,
  
  // Actions
  setFiles: (files) => set({ files }),
  
  selectFile: async (file) => {
    const { selectedFile, fileContent, contentCache } = get();

    // Cache current file's content before switching
    if (selectedFile && selectedFile.type === "file") {
      contentCache.set(selectedFile.name, fileContent);
    }
    
    if (file && file.type === "file") {
      // Check cache first — instant switch
      const cached = contentCache.get(file.name);
      if (cached !== undefined) {
        set({ selectedFile: file, fileContent: cached, isDirty: false });
        return;
      }

      // Not in cache — fetch from API
      set({ selectedFile: file, isLoading: true });
      await get().loadFileContent(file.name);
    } else {
      set({ selectedFile: file });
    }
  },
  
  setFileContent: (content) => {
    set({ 
      fileContent: content,
      isDirty: true
    });
  },
  
  createFile: async (fileName, language = "javascript") => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/storage/create-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName,
          content: "// New file content",
          language
        }),
      });

      if(response.status === 403){
        const error = new Error('File limit reached') as any;
        error.status = 403;
        throw error;
      }
      
      if (!response.ok) {
        throw new Error("Failed to create file");
      }
      // Refresh file list
      await get().fetchAllFiles();
      
      // Select the newly created file
      const newFile: FileNode = { name: fileName, type: "file", language };
      const defaultContent = "// New file content";
      get().contentCache.set(fileName, defaultContent);
      set({ selectedFile: newFile, fileContent: defaultContent, isDirty: false });
      
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteFile: async (fileName) => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/storage/delete-user-files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete file");
      }
      
      // Remove from cache
      get().contentCache.delete(fileName);
      
      // If the deleted file is the selected file, clear selection
      if (get().selectedFile?.name === fileName) {
        set({ selectedFile: null, fileContent: "" });
      }
      
      // Refresh file list
      await get().fetchAllFiles();
      
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadFileContent: async (fileName) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/storage/get-file-content?fileName=${encodeURIComponent(fileName)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({fileName})
      });
      
      if (!response.ok) {
        throw new Error("Failed to load file content");
      }
      
      const data = await response.json();
      const content = data.content || "";
      
      // Store in cache
      get().contentCache.set(fileName, content);
      
      set({ 
        fileContent: content, 
        isLoading: false,
        isDirty: false
      });
      
    } catch (error) {
      console.error("Error loading file content:", error);
      set({ fileContent: "// Error loading file content" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveFileContent: async () => {
    const { selectedFile, fileContent, contentCache } = get();
    if (!selectedFile) return;
    
    set({ isLoading: true });
    try {
      const response = await fetch("/api/storage/save-file", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          content: fileContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save file");
      }
      
      // Update cache with saved content
      contentCache.set(selectedFile.name, fileContent);
      set({ isDirty: false });
      return;
      
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchAllFiles: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/storage/list-all-user-files");
      
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      
      const data = await response.json();
      set({ files: data.files || [], hasFetchedInitialData: true });
      
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  editCurrentFile: async (newFileName: string, oldFileName: string) => {
    try {
      const response = await fetch("/api/storage/edit-current-file", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({newFileName, oldFileName})
      });
      if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update file");
      }
      const updatedData = await response.json();
      
      // Move cache entry to new name
      const { contentCache } = get();
      const cachedContent = contentCache.get(oldFileName);
      if (cachedContent !== undefined) {
        contentCache.delete(oldFileName);
        contentCache.set(newFileName, cachedContent);
      }
      
      // Update the selected file with the new name
      if (get().selectedFile?.name === oldFileName) {
        const updatedFile = {...get().selectedFile, name: newFileName, type: get().selectedFile?.type || "file"};
        set({ selectedFile: updatedFile });
      }
      
      return updatedData;
    } catch (error) {
      console.error("Error updating file:", error);
      throw error; 
    }
  },
  
  setIsDirty: (isDirty) => set({ isDirty })
}));

export default useFileStore;