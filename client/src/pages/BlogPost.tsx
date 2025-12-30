import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { BlogPost, BlogCategory } from "@shared/schema";

export default function BlogPostPage() {
  const { t, language } = useLanguage();
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) {
        throw new Error("Post not found");
      }
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  const getLocalizedTitle = (post: BlogPost) => {
    if (language === "en") return post.titleEn;
    if (language === "es") return post.titleEs;
    return post.titleFr;
  };

  const getLocalizedContent = (post: BlogPost) => {
    if (language === "en") return post.contentEn;
    if (language === "es") return post.contentEs;
    return post.contentFr;
  };

  const getLocalizedCategoryName = (category: BlogCategory) => {
    if (language === "en") return category.nameEn;
    if (language === "es") return category.nameEs;
    return category.nameFr;
  };

  const getCategoryForPost = (post: BlogPost) => {
    if (!categories || !post.categoryId) return null;
    return categories.find(c => c.id === post.categoryId);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString(language === "fr" ? "fr-CA" : language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container-padding max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blogue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = getCategoryForPost(post);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <article className="container-padding max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/blog">
            <Button variant="ghost" className="mb-6" data-testid="button-back-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.blog.title}
            </Button>
          </Link>

          {post.imageUrl && (
            <div className="relative h-64 md:h-96 overflow-hidden rounded-2xl mb-8">
              <img
                src={post.imageUrl}
                alt={getLocalizedTitle(post)}
                className="w-full h-full object-cover"
              />
              {post.isFeatured && (
                <Badge className="absolute top-4 left-4" variant="default">
                  {t.blog.featured}
                </Badge>
              )}
            </div>
          )}

          {post.videoUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <video
                src={post.videoUrl}
                controls
                className="w-full"
                poster={post.imageUrl || undefined}
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {category && (
              <Badge variant="secondary">
                {getLocalizedCategoryName(category)}
              </Badge>
            )}
            {post.tags?.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>

          <h1 
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            data-testid="text-post-title"
          >
            {getLocalizedTitle(post)}
          </h1>

          <div className="flex items-center gap-4 text-muted-foreground mb-8 flex-wrap">
            {post.authorName && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t.blog.by} {post.authorName}
              </span>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t.blog.publishedOn} {formatDate(post.publishedAt)}
              </span>
            )}
          </div>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: getLocalizedContent(post).replace(/\n/g, '<br />') }}
            data-testid="text-post-content"
          />
        </motion.div>
      </article>
    </div>
  );
}
