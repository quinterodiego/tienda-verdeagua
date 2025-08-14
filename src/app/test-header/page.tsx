import HeaderTest from '@/components/Header-test';

export default function TestPage() {
  return (
    <div>
      <HeaderTest />
      <main className="p-8">
        <h1 className="text-2xl font-bold">Página de Prueba</h1>
        <p>Esta página está usando el Header simplificado para probar si el error persiste.</p>
      </main>
    </div>
  );
}
