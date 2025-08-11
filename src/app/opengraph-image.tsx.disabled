import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/metadata';

// Comentado temporalmente para compatibilidad con Vercel
// export const runtime = 'edge';

export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #68c3b7 0%, #4fd1c7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px 60px',
            marginBottom: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              color: '#68c3b7',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            Verde Agua
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '10px',
              display: 'flex',
            }}
          >
            Personalizados
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: 'white',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.3',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
          }}
        >
          Productos únicos y personalizados para cada momento especial
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            marginTop: '40px',
            gap: '30px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              display: 'flex',
            }}
          >
            Agendas
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              display: 'flex',
            }}
          >
            Tazas
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              display: 'flex',
            }}
          >
            Llaveros
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              display: 'flex',
            }}
          >
            Stickers
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
