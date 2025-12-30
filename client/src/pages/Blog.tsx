import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, Star, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { BlogPost, BlogCategory } from "@shared/schema";

const pageTitles = {
  fr: "Blogue | QUEBEXICO",
  en: "Blog | QUEBEXICO",
  es: "Blog | QUEBEXICO",
};

export default function Blog() {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = pageTitles[language as keyof typeof pageTitles] || pageTitles.fr;
  }, [language]);

  const { data: posts, isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  const getLocalizedTitle = (post: BlogPost) => {
    if (language === "en") return post.titleEn;
    if (language === "es") return post.titleEs;
    return post.titleFr;
  };

  const getLocalizedExcerpt = (post: BlogPost) => {
    if (language === "en") return post.excerptEn;
    if (language === "es") return post.excerptEs;
    return post.excerptFr;
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

  const featuredPost = posts?.find(p => p.isFeatured);
  const regularPosts = posts?.filter(p => !p.isFeatured) || [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-padding max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-blog-title">
            {t.blog.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-testid="text-blog-subtitle">
            {t.blog.subtitle}
          </p>
        </motion.div>

        {postsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-8">
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Card 
                    className="overflow-hidden hover-elevate cursor-pointer group"
                    data-testid={`card-blog-featured-${featuredPost.id}`}
                  >
                    <div className="grid md:grid-cols-5 gap-0">
                      <div className="relative h-64 md:h-96 md:col-span-3 overflow-hidden">
                        {featuredPost.imageUrl ? (
                          <img
                            src={featuredPost.imageUrl}
                            alt={getLocalizedTitle(featuredPost)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Star className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        {featuredPost.videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-6 h-6 text-foreground ml-1" />
                            </div>
                          </div>
                        )}
                        <Badge className="absolute top-4 left-4" variant="default">
                          {t.blog.featured}
                        </Badge>
                      </div>
                      <CardContent className="p-6 md:p-8 flex flex-col justify-center md:col-span-2">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {getCategoryForPost(featuredPost) && (
                            <Badge variant="secondary">
                              {getLocalizedCategoryName(getCategoryForPost(featuredPost)!)}
                            </Badge>
                          )}
                          {featuredPost.tags?.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {getLocalizedTitle(featuredPost)}
                        </h2>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {getLocalizedExcerpt(featuredPost)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {featuredPost.authorName && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {featuredPost.authorName}
                            </span>
                          )}
                          {featuredPost.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(featuredPost.publishedAt)}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" className="w-fit group/btn">
                          {t.blog.readMore}
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card 
                      className="overflow-hidden hover-elevate cursor-pointer group h-full flex flex-col"
                      data-testid={`card-blog-post-${post.id}`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={getLocalizedTitle(post)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Star className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        {post.videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-5 h-5 text-foreground ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getCategoryForPost(post) && (
                            <Badge variant="secondary" className="text-xs">
                              {getLocalizedCategoryName(getCategoryForPost(post)!)}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {getLocalizedTitle(post)}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                          {getLocalizedExcerpt(post)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                          {post.authorName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.authorName}
                            </span>
                          )}
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.publishedAt)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg" data-testid="text-no-posts">
              {t.blog.noPosts}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
