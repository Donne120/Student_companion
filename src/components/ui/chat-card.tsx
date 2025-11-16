import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ChatCardProps {
  title: string;
  subtitle?: string;
  description: string;
  buttons?: Array<{
    icon?: string;
    label: string;
    link: string;
  }>;
}

export const ChatCard = ({ title, subtitle, description, buttons }: ChatCardProps) => {
  return (
    <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {subtitle && (
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </CardContent>
      {buttons && buttons.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap">
          {buttons.map((button, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => window.open(button.link, '_blank')}
              className="flex items-center gap-2"
            >
              {button.icon && <span>{button.icon}</span>}
              {button.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};