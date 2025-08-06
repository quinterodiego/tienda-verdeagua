import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Checkout',
  description: 'Finaliza tu compra de productos personalizados',
  type: 'website'
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
