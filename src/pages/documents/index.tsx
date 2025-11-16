
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DocumentManager } from "@/components/documents/DocumentManager";

export default function Documents() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="mb-6 hover:bg-primary/10"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <DocumentManager />
      </div>
    </div>
  );
}
