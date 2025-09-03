#!/bin/bash

# 🔍 Script de Verificación para tienda-verdeagua.com.ar

echo "🔍 Verificando configuración de tienda-verdeagua.com.ar..."
echo "=================================================="

DOMAIN="tienda-verdeagua.com.ar"
WWW_DOMAIN="www.tienda-verdeagua.com.ar"

echo ""
echo "📡 1. Verificando DNS..."
echo "------------------------"

# Verificar registro A
echo "🔹 Registro A para $DOMAIN:"
nslookup $DOMAIN 8.8.8.8 2>/dev/null | grep "Address:" | tail -1

# Verificar registro CNAME para www
echo "🔹 Registro CNAME para $WWW_DOMAIN:"
nslookup $WWW_DOMAIN 8.8.8.8 2>/dev/null | grep "canonical"

echo ""
echo "🌐 2. Verificando conectividad HTTP/HTTPS..."
echo "--------------------------------------------"

# Verificar HTTP
echo "🔹 HTTP Status:"
curl -s -o /dev/null -w "HTTP: %{http_code}" http://$DOMAIN
echo ""

# Verificar HTTPS
echo "🔹 HTTPS Status:"
curl -s -o /dev/null -w "HTTPS: %{http_code}" https://$DOMAIN
echo ""

# Verificar certificado SSL
echo "🔹 Certificado SSL:"
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null

echo ""
echo "🔧 3. Verificando redirecciones..."
echo "--------------------------------"

# WWW a no-WWW
echo "🔹 Redirección www → no-www:"
curl -s -o /dev/null -w "%{redirect_url}" https://$WWW_DOMAIN

echo ""
echo "🚀 4. Verificando API..."
echo "----------------------"

# API de salud
echo "🔹 API Status:"
curl -s https://$DOMAIN/api/debug/production-readiness | head -100

echo ""
echo "=================================================="
echo "✅ Verificación completada para $DOMAIN"
echo ""
echo "💡 Comandos útiles adicionales:"
echo "   - Verificar DNS online: https://dnschecker.org"
echo "   - Verificar SSL: https://www.ssllabs.com/ssltest/"
echo "   - Panel Vercel: https://vercel.com/dashboard"
echo "=================================================="
