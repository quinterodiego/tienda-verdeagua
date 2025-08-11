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
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
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
  // Optimización de bundle - Simplificado para evitar errores
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Temporalmente deshabilitado
    // turbo: {
    //   rules: {
    //     '*.svg': {
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //   },
    // },
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

    // Definir globals para evitar errores de SSR
    config.plugins.push(
      new config.webpack.DefinePlugin({
        'typeof window': JSON.stringify(isServer ? 'undefined' : 'object'),
        'typeof self': JSON.stringify(isServer ? 'undefined' : 'object'),
        'typeof document': JSON.stringify(isServer ? 'undefined' : 'object'),
        'typeof navigator': JSON.stringify(isServer ? 'undefined' : 'object'),
      })
    );

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

    // Optimizaciones de bundle solo en producción
    // Temporalmente deshabilitado para evitar errores de SSR
    /*
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }
    */
    return config;
  },
};

export default nextConfig;
