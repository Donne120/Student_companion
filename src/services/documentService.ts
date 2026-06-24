
import { toast } from "sonner";

export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  url: string;
  timestamp: number;
}

// In-memory document store (in a real app, this would be a database)
const documents: ProcessedDocument[] = [];

// Local storage key for persisting documents
const DOCUMENTS_STORAGE_KEY = 'alu_documents';

// Initialize from localStorage if available
const initializeDocuments = () => {
  try {
    const savedDocs = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (savedDocs) {
      const parsed = JSON.parse(savedDocs);
      documents.push(...parsed);
    }
  } catch (error) {
    console.error('Error loading documents:', error);
  }
};

// Call initialization
initializeDocuments();

// Save documents to localStorage
const persistDocuments = () => {
  localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
};

// Process a document (extract text, etc.)
const processDocument = async (file: File): Promise<ProcessedDocument> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const id = Date.now().toString();
        const content = event.target?.result as string || '';
        
        // Extract content from PDF or other document types
        // For now, we'll just use the raw text for demo purposes
        // In a production app, you'd use a PDF parsing library
        
        const newDoc: ProcessedDocument = {
          id,
          title: file.name,
          content,
          type: file.type,
          url: URL.createObjectURL(file),
          timestamp: Date.now()
        };
        
        // Add to our document store
        documents.push(newDoc);
        persistDocuments();
        
        resolve(newDoc);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    // Read as text for now
    // For PDFs, you would use a PDF.js or similar library 
    reader.readAsText(file);
  });
};

// Get all documents
const getAllDocuments = (): ProcessedDocument[] => {
  return [...documents];
};

// Delete a document
const deleteDocument = (id: string): boolean => {
  const index = documents.findIndex(doc => doc.id === id);
  if (index !== -1) {
    documents.splice(index, 1);
    persistDocuments();
    return true;
  }
  return false;
};

// Search documents for relevant content
const searchDocuments = (query: string): string => {
  // Simple search implementation
  // In a production app, you'd use vector embeddings or a more sophisticated search
  const results = documents
    .filter(doc => 
      doc.content.toLowerCase().includes(query.toLowerCase()) ||
      doc.title.toLowerCase().includes(query.toLowerCase())
    )
    .map(doc => {
      // Extract a relevant snippet
      const lowerContent = doc.content.toLowerCase();
      const queryPos = lowerContent.indexOf(query.toLowerCase());
      const start = Math.max(0, queryPos - 100);
      const end = Math.min(doc.content.length, queryPos + query.length + 100);
      const snippet = doc.content.substring(start, end);
      
      return `Source: ${doc.title}\n${snippet}\n\n`;
    })
    .join('');
    
  return results || "No relevant documents found.";
};

export const documentService = {
  processDocument,
  getAllDocuments,
  deleteDocument,
  searchDocuments
};
