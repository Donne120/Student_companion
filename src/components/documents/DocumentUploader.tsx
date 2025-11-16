
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { documentService, ProcessedDocument } from "@/services/documentService";

interface DocumentUploaderProps {
  onDocumentProcessed: (document: ProcessedDocument) => void;
}

export const DocumentUploader = ({ onDocumentProcessed }: DocumentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = files[0];
      
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('text')) {
        toast.error("Only PDF and text documents are supported");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      toast.info(`Processing ${file.name}...`, {
        duration: 2000
      });
      
      const processedDoc = await documentService.processDocument(file);
      
      toast.success(`Successfully processed ${file.name}`);
      onDocumentProcessed(processedDoc);
    } catch (error) {
      console.error("Error processing document:", error);
      toast.error("Failed to process document");
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };
  
  return (
    <div className="flex flex-col items-center p-6 border border-dashed border-gray-300 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
      <Upload className="w-8 h-8 text-primary mb-2" />
      <h3 className="text-lg font-medium mb-1">Upload ALU Documents</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Upload PDF or text files to enhance the AI's knowledge about ALU
      </p>
      
      <input
        type="file"
        id="document-upload"
        className="hidden"
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      
      <Button 
        onClick={() => document.getElementById('document-upload')?.click()}
        disabled={isUploading}
        className="relative"
      >
        {isUploading ? "Processing..." : "Select Document"}
        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          </span>
        )}
      </Button>
    </div>
  );
};
