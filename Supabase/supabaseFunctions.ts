import { supabase } from "./supabaseClient";

interface FileNode {
  name: string;
  type: "file" | "folder";
  expanded?: boolean;
  children?: FileNode[];
  language?: string;
}

function buildFileTree(files: any[]): FileNode[] {
  const fileTree: FileNode[] = [];

  files.forEach((file) => {
    const parts = file.name.split("/");
    let currentLevel = fileTree;

    for (let i = 0; i < parts.length; i++) {
      const existingNode = currentLevel.find((node) => node.name === parts[i]);

      if (existingNode) {
        currentLevel = existingNode.children!;
      } else {
        const newNode: FileNode = {
          name: parts[i],
          type: i === parts.length - 1 ? "file" : "folder",
          expanded: false,
          children: i === parts.length - 1 ? undefined : [],
        };

        currentLevel.push(newNode);
        if (newNode.type === "folder") currentLevel = newNode.children!;
      }
    }
  });

  return fileTree;
}


export async function createFile(fileName: string, userId: string) {
  try {
    console.log("Creating empty file:", fileName, "for User ID:", userId);

    const filePath = `${userId}/${fileName}`; // Organizing files by user

    const emptyFile = new Blob([""], { type: "text/plain" }); // Empty file content

    const { data, error } = await supabase.storage
      .from("ide-files") // 🔹 Use your actual bucket name
      .upload(filePath, emptyFile, { upsert: true });

    if (error) {
      console.error("Supabase Storage Error:", error.message);
      throw error;
    }

    console.log("Created File Path:", data.path);

    // 🔹 Generate a public URL (since your storage is public)
    const { data: publicUrlData } = supabase.storage
      .from("ide-files")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl; // Return public URL
  } catch (err) {
    console.error("Error in createFile:", err);
    throw err;
  }
}


export const savedFile = async (userId: string, fileName: string, content: string) => {
  try {
    const filePath = `${userId}/${fileName}`;

    // Convert content to Blob (text-based)
    const fileBlob = new Blob([content], { type: "text/plain" });

    // 🔍 Check if file exists
    const { data: existingFile, error: fetchError } = await supabase.storage
      .from("ide-files")
      .list(userId);

    if (fetchError) throw fetchError;

    const fileExists = existingFile.some(file => file.name === fileName);

    if (fileExists) {
      // 🗑️ Delete the existing file
      await supabase.storage.from("ide-files").remove([filePath]);
    }
    // 📤 Upload new file
    const { data, error } = await supabase.storage
      .from("ide-files")
      .upload(filePath, fileBlob, { cacheControl: "3600", upsert: true });

    if (error) throw error;

    console.log("✅ File saved successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error saving file:", error);
    return { success: false, error };
  }
};



export const getFileContent = async (fileName: string, userId: string) => {
  if (!userId) throw new Error("User ID is required!");

  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("ide-files")
    .download(filePath);

  if (error) throw error;

  const fileContent = await data.text();

  return fileContent;
};

export const editCurrentFile = async (
  oldFileName: string,
  newFileName: string,
  userId: string
) => {
  try {
    const bucketName = "ide-files";

    // 🛠 Step 1: Fetch user files to verify existence
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucketName)
      .list(userId);

    if (listError) throw new Error(`Failed to fetch files: ${listError.message}`);

    // ✅ Check if the file exists in the list
    const oldFile = fileList.find((file) => file.name === oldFileName);
    if (!oldFile) {
      throw new Error(`File "${oldFileName}" does not exist in storage.`);
    }

    // 🔍 Construct correct paths
    const oldFilePath = `${userId}/${oldFileName}`; // FIX: Use oldFileName instead of oldFile
    const newFilePath = `${userId}/${newFileName}`;

    console.log("📝 Attempting to rename file:");
    console.log("📂 Old Path:", oldFilePath);
    console.log("📂 New Path:", newFilePath);

    // 🛠 Step 2: Move file (rename)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .move(oldFilePath, newFilePath);

    if (error) throw new Error(`Failed to rename file: ${error.message}`);

    console.log("✅ File renamed successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error renaming file:", error);
    return { success: false, error: error instanceof Error ? error.message : error };
  }
};


export const listUserFiles = async (userId: string) => {
  if (!userId) throw new Error("User ID is required!");

  const { data, error } = await supabase.storage.from("ide-files").list(userId);

  if (error) throw error;

  const fileTree = buildFileTree(data);

  return fileTree;
};


export const deleteFile = async (fileName: string, userId: string) => {
  if (!userId) throw new Error("User ID is required!");

  const filePath = `${userId}/${fileName}`;
  const { error, data } = await supabase.storage.from("ide-files").remove([filePath]);

  if (error) throw error;

  return { success: true, path: filePath };
};


export const deleteWholeProject = async (userId: string) => {
  if (!userId) throw new Error("User ID is required!");

  // List all files inside the user's folder
  const { data: files, error: listError } = await supabase.storage.from("ide-files").list(`files/${userId}`);

  if (listError || !files) throw new Error("Error fetching user files!");

  const filePaths = files.map((file) => `files/${userId}/${file.name}`);
  const { error: deleteError } = await supabase.storage.from("ide-files").remove(filePaths);
  if (deleteError) throw new Error("Error deleting project files!");

  return { message: "All files deleted successfully!", deletedFiles: filePaths };
};


