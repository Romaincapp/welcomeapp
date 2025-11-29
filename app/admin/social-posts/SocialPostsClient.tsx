'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Edit, Eye, EyeOff, ExternalLink, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  createOfficialPost,
  updateOfficialPost,
  deleteOfficialPost,
  togglePostActive,
} from '@/lib/actions/admin/social-posts'
import { createClient } from '@/lib/supabase/client'
import { compressImage, validateImageFile } from '@/lib/utils/image-compression'
import type { OfficialSocialPostWithStats } from '@/types'

interface SocialPostsClientProps {
  initialPosts: OfficialSocialPostWithStats[]
  stats: {
    total_posts: number
    active_posts: number
    total_shares: number
    total_credits_distributed: number
    unique_sharers: number
  } | null
}

const platformIcons: Record<string, string> = {
  instagram: '📸',
  linkedin: '🔵',
  facebook: '📘',
  twitter: '🐦',
  blog: '✍️',
  newsletter: '📧',
}

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  linkedin: 'bg-blue-600',
  facebook: 'bg-blue-700',
  twitter: 'bg-sky-500',
  blog: 'bg-gray-700',
  newsletter: 'bg-green-600',
}

export default function SocialPostsClient({ initialPosts, stats }: SocialPostsClientProps) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState<OfficialSocialPostWithStats | null>(null)

  // Form state
  const [platform, setPlatform] = useState('')
  const [postUrl, setPostUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [imageRatio, setImageRatio] = useState<'landscape' | 'portrait' | 'square'>('square')
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('')
  const [creditsReward, setCreditsReward] = useState(90)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const resetForm = () => {
    setPlatform('')
    setPostUrl('')
    setThumbnailUrl('')
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setImageRatio('square')
    setCaption('')
    setCategory('')
    setCreditsReward(90)
    setEditingPost(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation côté client
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Type de fichier non supporté. Utilisez JPEG, PNG, WebP ou GIF.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 10 MB)')
      return
    }

    setThumbnailFile(file)

    // Créer un preview local et détecter le ratio
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setThumbnailPreview(dataUrl)

      // Détecter le ratio de l'image
      const img = new window.Image()
      img.onload = () => {
        const ratio = img.width / img.height
        if (ratio > 1.2) {
          setImageRatio('landscape') // 16:9, 4:3, etc.
        } else if (ratio < 0.8) {
          setImageRatio('portrait') // 9:16, 3:4, etc.
        } else {
          setImageRatio('square') // ~1:1
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setThumbnailUrl('')
  }

  // Upload image directement via Supabase client (évite limite 1MB Server Actions)
  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient()

    // Compression côté client
    const compressedFile = await compressImage(file, 800, 0.85)

    // Générer nom unique
    const fileName = `social-post-${Date.now()}.${compressedFile.type.split('/')[1] || 'webp'}`
    const filePath = `social-posts/${fileName}`

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, compressedFile)

    if (uploadError) {
      console.error('[SOCIAL POST UPLOAD] Erreur:', uploadError)
      return null
    }

    // Récupérer URL publique
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    console.log('[SOCIAL POST UPLOAD] ✅ Upload réussi:', publicUrlData.publicUrl)
    return publicUrlData.publicUrl
  }

  const handleCreate = async () => {
    if (!platform || !postUrl || !caption) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    setLoading(true)

    // Uploader l'image si un fichier est sélectionné
    let finalThumbnailUrl = thumbnailUrl
    if (thumbnailFile) {
      setUploadingImage(true)
      const url = await uploadImage(thumbnailFile)
      setUploadingImage(false)

      if (!url) {
        alert('Erreur lors de l\'upload de l\'image')
        setLoading(false)
        return
      }
      finalThumbnailUrl = url
    }

    const result = await createOfficialPost({
      platform: platform as 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'blog' | 'newsletter',
      post_url: postUrl,
      thumbnail_url: finalThumbnailUrl || undefined,
      caption,
      category: category || undefined,
      credits_reward: creditsReward,
    })

    if (result.success && result.data) {
      setPosts([result.data as OfficialSocialPostWithStats, ...posts])
      setShowCreateModal(false)
      resetForm()
      router.refresh()
    } else {
      alert(result.error || 'Erreur lors de la création')
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!editingPost) return

    setLoading(true)

    // Uploader l'image si un nouveau fichier est sélectionné
    let finalThumbnailUrl = thumbnailUrl
    if (thumbnailFile) {
      setUploadingImage(true)
      const url = await uploadImage(thumbnailFile)
      setUploadingImage(false)

      if (!url) {
        alert('Erreur lors de l\'upload de l\'image')
        setLoading(false)
        return
      }
      finalThumbnailUrl = url
    }

    const result = await updateOfficialPost(editingPost.id, {
      platform: platform as 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'blog' | 'newsletter',
      post_url: postUrl,
      thumbnail_url: finalThumbnailUrl || null,
      caption,
      category: category || null,
      credits_reward: creditsReward,
    })

    if (result.success && result.data) {
      setPosts(posts.map((p) => (p.id === editingPost.id ? (result.data as OfficialSocialPostWithStats) : p)))
      setShowCreateModal(false)
      resetForm()
      router.refresh()
    } else {
      alert(result.error || 'Erreur lors de la mise à jour')
    }
    setLoading(false)
  }

  const handleDelete = async (postId: string) => {
    const result = await deleteOfficialPost(postId)
    if (result.success) {
      setPosts(posts.filter((p) => p.id !== postId))
      router.refresh()
    } else {
      alert(result.error || 'Erreur lors de la suppression')
    }
  }

  const handleToggleActive = async (postId: string, isActive: boolean) => {
    const result = await togglePostActive(postId, !isActive)
    if (result.success) {
      setPosts(posts.map((p) => (p.id === postId ? { ...p, is_active: !isActive } : p)))
      router.refresh()
    } else {
      alert(result.error || 'Erreur lors de la modification')
    }
  }

  const openEditModal = (post: OfficialSocialPostWithStats) => {
    setEditingPost(post)
    setPlatform(post.platform)
    setPostUrl(post.post_url)
    setThumbnailUrl(post.thumbnail_url || '')
    setThumbnailPreview(post.thumbnail_url || null)
    setThumbnailFile(null)
    setCaption(post.caption)
    setCategory(post.category || '')
    setCreditsReward(post.credits_reward)
    setShowCreateModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour admin
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                📤 Posts Officiels WelcomeApp
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gérez les posts que les gestionnaires peuvent repartager pour gagner des crédits
              </p>
            </div>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setShowCreateModal(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingPost ? 'Modifier le post' : 'Ajouter un post officiel'}</DialogTitle>
                  <DialogDescription>
                    Les gestionnaires pourront repartager ce post pour gagner des crédits
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Platform */}
                  <div>
                    <Label htmlFor="platform">Plateforme *</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une plateforme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">📸 Instagram</SelectItem>
                        <SelectItem value="linkedin">🔵 LinkedIn</SelectItem>
                        <SelectItem value="facebook">📘 Facebook</SelectItem>
                        <SelectItem value="twitter">🐦 Twitter</SelectItem>
                        <SelectItem value="blog">✍️ Blog</SelectItem>
                        <SelectItem value="newsletter">📧 Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Post URL */}
                  <div>
                    <Label htmlFor="postUrl">URL du post *</Label>
                    <Input
                      id="postUrl"
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                    />
                  </div>

                  {/* Thumbnail Image Upload */}
                  <div>
                    <Label>Image d'aperçu (optionnel)</Label>
                    {thumbnailPreview ? (
                      <div className={`mt-2 relative group ${
                        imageRatio === 'landscape' ? 'w-64 h-36' :
                        imageRatio === 'portrait' ? 'w-28 h-48' :
                        'w-40 h-40'
                      }`}>
                        <Image
                          src={thumbnailPreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {thumbnailFile && (
                          <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                            Nouveau fichier
                          </span>
                        )}
                      </div>
                    ) : (
                      <label className="mt-2 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Cliquez ou glissez une image
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          JPEG, PNG, WebP ou GIF (max 10 MB)
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleFileSelect}
                        />
                      </label>
                    )}
                  </div>

                  {/* Caption */}
                  <div>
                    <Label htmlFor="caption">Caption (extrait du contenu) *</Label>
                    <Textarea
                      id="caption"
                      placeholder="15 minutes pour créer mon guide de bienvenue digital..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{caption.length}/200 caractères</p>
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Catégorie (optionnel)</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Aucune" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="testimonial">Témoignage</SelectItem>
                        <SelectItem value="benefit">Bénéfice</SelectItem>
                        <SelectItem value="stats">Statistiques</SelectItem>
                        <SelectItem value="comparison">Avant/Après</SelectItem>
                        <SelectItem value="engagement">Question</SelectItem>
                        <SelectItem value="insight">Insight</SelectItem>
                        <SelectItem value="problem_solution">Problème/Solution</SelectItem>
                        <SelectItem value="quick_share">Partage rapide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Credits Reward */}
                  <div>
                    <Label htmlFor="creditsReward">Crédits gagnés *</Label>
                    <Input
                      id="creditsReward"
                      type="number"
                      min="0"
                      value={creditsReward}
                      onChange={(e) => setCreditsReward(parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommandé: 90 (LinkedIn/Facebook/Instagram), 60 (Twitter)
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false)
                        resetForm()
                      }}
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                    <Button onClick={editingPost ? handleUpdate : handleCreate} disabled={loading}>
                      {uploadingImage
                        ? 'Upload de l\'image...'
                        : loading
                          ? 'Enregistrement...'
                          : editingPost
                            ? 'Mettre à jour'
                            : 'Créer'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_posts}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Posts Actifs</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active_posts}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Partages</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_shares}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Crédits Distribués</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total_credits_distributed}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Gestionnaires Actifs</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.unique_sharers}</p>
              </Card>
            </div>
          )}
        </div>

        {/* Posts List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <Card className="p-12 text-center col-span-full">
              <p className="text-gray-500 dark:text-gray-400">Aucun post officiel pour le moment</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Ajoutez vos premiers posts que les gestionnaires pourront partager</p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className={`p-5 ${!post.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{platformIcons[post.platform]}</span>
                    <Badge className={`${platformColors[post.platform]} text-white capitalize`}>
                      {post.platform}
                    </Badge>
                    {!post.is_active && <Badge variant="secondary">Inactif</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(post.id, post.is_active)}
                    >
                      {post.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Voulez-vous vraiment supprimer ce post ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(post.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {post.thumbnail_url && (
                  <div className="relative w-full h-48 mb-3 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.caption}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">{post.caption}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>+{post.credits_reward} crédits</span>
                  {post.category && <Badge variant="outline" className="text-xs">{post.category}</Badge>}
                </div>

                {post.unique_sharers !== undefined && (
                  <div className="pt-3 border-t dark:border-gray-700 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {post.total_shares || 0} partages · {post.unique_sharers || 0} gestionnaires
                    </span>
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      Voir <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
