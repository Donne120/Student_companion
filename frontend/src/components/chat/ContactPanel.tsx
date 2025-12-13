import { Mail, Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
}

interface ContactPanelProps {
  contact: ContactInfo;
}

export const ContactPanel = ({ contact }: ContactPanelProps) => {
  if (!contact || (!contact.email && !contact.phone && !contact.location)) {
    return null;
  }

  return (
    <Card className="mt-4 p-4 bg-brand-blue/30 border-brand-gold/20">
      <div className="flex items-center gap-2 mb-3">
        <Phone className="w-4 h-4 text-brand-gold" />
        <h4 className="font-semibold text-brand-gold">Need Help? Contact Us</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        {contact.email && (
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-300">Email:</span>{' '}
              <a 
                href={`mailto:${contact.email}`}
                className="text-brand-gold hover:underline"
              >
                {contact.email}
              </a>
            </div>
          </div>
        )}
        
        {contact.phone && (
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-300">Phone:</span>{' '}
              <a 
                href={`tel:${contact.phone}`}
                className="text-brand-gold hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        )}
        
        {contact.location && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-300">Location:</span>{' '}
              <span className="text-gray-300">{contact.location}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

