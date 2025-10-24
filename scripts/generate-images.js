/**
 * Script pour générer les images SEO et PWA (og-image, icons, favicon)
 * Utilise node-canvas pour dessiner le logo WA
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// Couleurs du thème WelcomeApp
const PRIMARY_COLOR = '#4F46E5' // Indigo
const SECONDARY_COLOR = '#ffffff' // Blanc

/**
 * Dessine le logo WA stylisé
 */
function drawLogo(ctx, centerX, centerY, size) {
  ctx.fillStyle = PRIMARY_COLOR
  ctx.font = `bold ${size}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Dessiner "WA" avec effet moderne
  ctx.fillText('WA', centerX, centerY)
}

/**
 * Génère l'image Open Graph (1200x630px)
 */
function generateOGImage() {
  const width = 1200
  const height = 630
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fond dégradé
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#4F46E5')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Logo WA au centre
  ctx.fillStyle = SECONDARY_COLOR
  ctx.font = 'bold 180px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('WA', width / 2, height / 2 - 80)

  // Titre en dessous
  ctx.font = 'bold 52px Arial, sans-serif'
  ctx.fillText('WelcomeApp', width / 2, height / 2 + 80)

  // Sous-titre
  ctx.font = '32px Arial, sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fillText('Welcomebook Digital pour Locations de Vacances', width / 2, height / 2 + 140)

  // Sauvegarder
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
  fs.writeFileSync(path.join(__dirname, '../public/og-image.jpg'), buffer)
  console.log('✅ og-image.jpg créé (1200x630)')
}

/**
 * Génère une icône PWA carrée
 */
function generateIcon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Fond avec couleur primaire
  ctx.fillStyle = PRIMARY_COLOR
  ctx.fillRect(0, 0, size, size)

  // Logo WA centré
  ctx.fillStyle = SECONDARY_COLOR
  const fontSize = Math.floor(size * 0.5)
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('WA', size / 2, size / 2)

  // Sauvegarder
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(__dirname, `../public/${filename}`), buffer)
  console.log(`✅ ${filename} créé (${size}x${size})`)
}

/**
 * Génère le favicon (32x32)
 */
function generateFavicon() {
  const size = 32
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Fond avec couleur primaire
  ctx.fillStyle = PRIMARY_COLOR
  ctx.fillRect(0, 0, size, size)

  // Logo WA simplifié
  ctx.fillStyle = SECONDARY_COLOR
  ctx.font = 'bold 20px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('WA', size / 2, size / 2)

  // Sauvegarder en PNG (on convertira en .ico manuellement si besoin)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), buffer)
  console.log('✅ favicon.png créé (32x32)')
}

/**
 * Génère l'apple-touch-icon (180x180)
 */
function generateAppleTouchIcon() {
  generateIcon(180, 'apple-touch-icon.png')
}

// Générer toutes les images
console.log('🎨 Génération des images SEO et PWA...\n')

try {
  generateOGImage()
  generateIcon(192, 'icon-192.png')
  generateIcon(512, 'icon-512.png')
  generateAppleTouchIcon()
  generateFavicon()
  console.log('\n✨ Toutes les images ont été générées avec succès !')
} catch (error) {
  console.error('❌ Erreur lors de la génération des images:', error)
  process.exit(1)
}
