interface AlertProps {
  type?: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

const styles = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function Alert({ type = 'info', children }: AlertProps) {
  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${styles[type]}`} role="alert">
      {children}
    </div>
  );
}