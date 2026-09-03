import { HtmlHTMLAttributes, forwardRef } from 'react';

interface CardProps extends HtmlHTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
));

Card.displayName = 'Card';

const CardHeader = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`border-b border-gray-200 px-5 py-4 ${className}`}>{children}</div>
);

const CardTitle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-base font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardBody = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

const CardFooter = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`border-t border-gray-200 px-5 py-3 ${className}`}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardBody, CardFooter };