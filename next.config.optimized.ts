import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración más permisiva para producción
  eslint: {
    // ⚠️ Solo para deployment inicial - arreglar después
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Solo para deployment inicial - arreglar después  
    ignoreBuildErrors: true,
  },
  // Performance optimizations - CORREGIDAS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimización de bundles - SOLO LUCIDE REACT
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  
  // External packages for server components
  serverExternalPackages: ['googleapis', 'google-spreadsheet'],
  // PWA and Service Worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  // Optimización de imágenes para next-gen formats
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 año
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Optimización de bundle - SOLO LUCIDE REACT (CSS optimización deshabilitada)
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Prevenir problemas con self y window en SSR
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Temporalmente comentado el DefinePlugin hasta que se resuelva el error de importación
    // config.plugins.push(
    //   new webpack.DefinePlugin({
    //     'typeof window': JSON.stringify(isServer ? 'undefined' : 'object'),
    //     'typeof self': JSON.stringify(isServer ? 'undefined' : 'object'),
    //     'typeof document': JSON.stringify(isServer ? 'undefined' : 'object'),
    //     'typeof navigator': JSON.stringify(isServer ? 'undefined' : 'object'),
    //   })
    // );

    // Manejar problemas con service workers
    // Temporalmente deshabilitado para evitar errores
    // config.module.rules.push({
    //   test: /\.(js|jsx|ts|tsx)$/,
    //   use: {
    //     loader: 'babel-loader',
    //     options: {
    //       presets: ['next/babel'],
    //       plugins: []
    //     }
    //   }
    // });

    // Optimizaciones de bundle SUPER AGRESIVAS para performance
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 10000,    // Reducido de 20000
          maxSize: 100000,   // Reducido de 200000
          maxInitialRequests: 25, // Aumentado
          maxAsyncRequests: 30,   // Aumentado
          cacheGroups: {
            // React core - muy pequeño
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 50,
              enforce: true,
            },
            // Next.js core
            nextjs: {
              test: /[\\/]node_modules[\\/]next[\\/]/,
              name: 'nextjs',
              chunks: 'all',
              priority: 45,
              enforce: true,
            },
            // UI Libraries separadas
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|@headlessui|@heroicons)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            // Auth libraries
            auth: {
              test: /[\\/]node_modules[\\/](next-auth|@auth)[\\/]/,
              name: 'auth',
              chunks: 'all',
              priority: 35,
              enforce: true,
            },
            // Librerías de terceros más granulares
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 20,
              minChunks: 1,
              maxSize: 50000, // Máximo 50KB por chunk
            },
            // Código común de la aplicación más granular
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              enforce: true,
              maxSize: 30000, // Máximo 30KB
            },
          },
        },
        // Tree shaking más agresivo
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
};

export default nextConfig;
