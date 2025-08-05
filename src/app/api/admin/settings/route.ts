import { NextRequest, NextResponse } from 'next/server';

interface SiteSettings {
  storeName: string;
  contactEmail: string;
  contactFormEmail?: string; // Nuevo campo para mensajes de contacto
  description: string;
  currency: string;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    newUsers: boolean;
  };
  paymentMethods: {
    mercadopago: boolean;
    cashOnPickup: boolean;
  };
  shipping: {
    trackingUrl?: string; // URL de la empresa de paquetería para tracking
    trackingUrlPlaceholder?: string; // Placeholder para mostrar cómo usar la URL
  };
  lastUpdated?: string;
}

export async function GET() {
  console.log('🔍 Obteniendo configuración del sitio...');
  
  try {
    const { GoogleSpreadsheet } = await import('google-spreadsheet');
    const { JWT } = await import('google-auth-library');

    // Configurar autenticación
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Abrir la hoja de cálculo
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();

    // Buscar o crear la hoja de configuración
    let settingsSheet = doc.sheetsByTitle['Configuracion'];
    let isNewSheet = false;
    
    if (!settingsSheet) {
      console.log('📋 Creando hoja de Configuración...');
      settingsSheet = await doc.addSheet({
        title: 'Configuracion',
        headerValues: [
          'Clave',
          'Valor',
          'Tipo',
          'Descripcion',
          'UltimaActualizacion'
        ]
      });
      isNewSheet = true;
    }

    // Cargar los headers
    await settingsSheet.loadHeaderRow();
    
    // Si es una hoja nueva o está vacía, agregar configuración por defecto
    let rows = await settingsSheet.getRows();
    if (isNewSheet || rows.length === 0) {
      console.log('📝 Agregando configuración por defecto...');
      const defaultSettings: SiteSettings = {
        storeName: 'TechStore',
        contactEmail: 'contact@techstore.com',
        description: 'La mejor tienda de tecnología online',
        currency: 'ARS',
        notifications: {
          newOrders: true,
          lowStock: true,
          newUsers: false
        },
        paymentMethods: {
          mercadopago: true,
          cashOnPickup: true
        },
        shipping: {
          trackingUrl: '',
          trackingUrlPlaceholder: ''
        },
        lastUpdated: new Date().toISOString()
      };

      await saveSettingsToSheet(settingsSheet, defaultSettings);
      // Recargar las filas después de agregar datos
      rows = await settingsSheet.getRows();
      
      // Leer la configuración recién creada
      const settings = parseSettingsFromRows(rows);
      console.log('✅ Configuración por defecto creada exitosamente');
      return NextResponse.json({
        success: true,
        settings
      });
    }

    // Leer configuración existente
    const settings = parseSettingsFromRows(rows);

    console.log('✅ Configuración obtenida exitosamente');
    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('💥 Error obteniendo configuración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log('💾 Actualizando configuración del sitio...');
  
  try {
    const body = await request.json();
    const settings: SiteSettings = {
      ...body,
      lastUpdated: new Date().toISOString()
    };

    const { GoogleSpreadsheet } = await import('google-spreadsheet');
    const { JWT } = await import('google-auth-library');

    // Configurar autenticación
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Abrir la hoja de cálculo
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();

    // Obtener la hoja de configuración
    let settingsSheet = doc.sheetsByTitle['Configuracion'];
    if (!settingsSheet) {
      console.log('📋 Creando hoja de Configuración...');
      settingsSheet = await doc.addSheet({
        title: 'Configuracion',
        headerValues: [
          'Clave',
          'Valor',
          'Tipo',
          'Descripcion',
          'UltimaActualizacion'
        ]
      });
    }

    // Guardar configuración
    await saveSettingsToSheet(settingsSheet, settings);

    console.log('✅ Configuración actualizada exitosamente');
    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      settings
    });

  } catch (error) {
    console.error('💥 Error actualizando configuración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// Función auxiliar para parsear configuración desde las filas
function parseSettingsFromRows(rows: any[]): any {
  const settings: any = {};
  
  for (const row of rows) {
    const key = row.get('Clave');
    const value = row.get('Valor');
    const type = row.get('Tipo');
    
    if (key && value !== undefined) {
      // Parsear el valor según el tipo
      if (type === 'boolean') {
        settings[key] = value === 'true';
      } else if (type === 'number') {
        settings[key] = parseFloat(value) || 0;
      } else if (type === 'object') {
        try {
          settings[key] = JSON.parse(value);
        } catch (e) {
          console.warn(`Error parseando objeto ${key}:`, e);
          settings[key] = {};
        }
      } else {
        settings[key] = value;
      }
    }
  }
  
  return settings;
}

// Función auxiliar para guardar configuración en la hoja
async function saveSettingsToSheet(sheet: any, settings: SiteSettings) {
  // Limpiar la hoja primero
  await sheet.loadHeaderRow();
  const existingRows = await sheet.getRows();
  for (const row of existingRows) {
    await row.delete();
  }

  // Mapear la configuración a filas
  const settingsMap = [
    {
      key: 'storeName',
      value: settings.storeName,
      type: 'string',
      description: 'Nombre de la tienda'
    },
    {
      key: 'contactEmail',
      value: settings.contactEmail,
      type: 'string',
      description: 'Email de contacto general'
    },
    {
      key: 'contactFormEmail',
      value: settings.contactFormEmail || settings.contactEmail,
      type: 'string',
      description: 'Email para recibir mensajes del formulario de contacto'
    },
    {
      key: 'description',
      value: settings.description,
      type: 'string',
      description: 'Descripción de la tienda'
    },
    {
      key: 'currency',
      value: settings.currency,
      type: 'string',
      description: 'Moneda por defecto'
    },
    {
      key: 'notifications',
      value: JSON.stringify(settings.notifications),
      type: 'object',
      description: 'Configuración de notificaciones'
    },
    {
      key: 'paymentMethods',
      value: JSON.stringify(settings.paymentMethods),
      type: 'object',
      description: 'Métodos de pago habilitados'
    },
    {
      key: 'shipping',
      value: JSON.stringify(settings.shipping),
      type: 'object',
      description: 'Configuración de envíos y seguimiento'
    },
    {
      key: 'lastUpdated',
      value: settings.lastUpdated || new Date().toISOString(),
      type: 'string',
      description: 'Fecha de última actualización'
    }
  ];

  // Agregar todas las filas
  for (const setting of settingsMap) {
    await sheet.addRow({
      'Clave': setting.key,
      'Valor': setting.value,
      'Tipo': setting.type,
      'Descripcion': setting.description,
      'UltimaActualizacion': new Date().toISOString()
    });
  }
}
